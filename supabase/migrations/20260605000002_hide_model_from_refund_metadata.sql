-- Migration: Hide model and provider from refund metadata
-- Date: 2026-06-05

-- Drop the old functions to avoid PostgREST overload ambiguity
DROP FUNCTION IF EXISTS finalize_ai_job(UUID, BOOLEAN, INTEGER, INTEGER, INTEGER, TEXT, TEXT);
DROP FUNCTION IF EXISTS finalize_ai_job(UUID, BOOLEAN, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION finalize_ai_job(
  p_log_id UUID,
  p_success BOOLEAN,
  p_prompt_tokens INTEGER DEFAULT 0,
  p_completion_tokens INTEGER DEFAULT 0,
  p_latency_ms INTEGER DEFAULT 0,
  p_model_used TEXT DEFAULT 'unknown',
  p_provider TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_log ai_generation_logs%ROWTYPE;
  v_current_credits INTEGER;
BEGIN
  SELECT * INTO v_log
  FROM ai_generation_logs
  WHERE id = p_log_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'AI Generation Log not found';
  END IF;

  IF v_log.status != 'pending' THEN
    RAISE NOTICE 'Job already finalized';
    RETURN;
  END IF;

  IF p_success THEN
    UPDATE ai_generation_logs
    SET status = 'success',
        prompt_tokens = p_prompt_tokens,
        completion_tokens = p_completion_tokens,
        total_tokens = p_prompt_tokens + p_completion_tokens,
        latency_ms = p_latency_ms,
        model_used = p_model_used,
        provider = COALESCE(p_provider, provider)
    WHERE id = p_log_id;
    
    -- Update Ledger to finalize the transaction type
    UPDATE credit_transactions 
    SET transaction_type = v_log.action_type
    WHERE reference_id = p_log_id AND transaction_type = 'PENDING_RESERVATION';

  ELSE
    -- Refund
    UPDATE users
    SET credits_balance = credits_balance + v_log.credits_used
    WHERE id = v_log.user_id
    RETURNING credits_balance INTO v_current_credits;

    UPDATE ai_generation_logs
    SET status = 'failed',
        error_message = p_error_message,
        prompt_tokens = p_prompt_tokens,
        completion_tokens = p_completion_tokens,
        latency_ms = p_latency_ms,
        model_used = p_model_used,
        provider = COALESCE(p_provider, provider)
    WHERE id = p_log_id;
    
    -- Write Refund to Ledger
    INSERT INTO credit_transactions (
      user_id, amount, balance_after, transaction_type, reference_type, reference_id, metadata
    ) VALUES (
      v_log.user_id, v_log.credits_used, v_current_credits, 'REFUND', 'ai_generation_logs', p_log_id,
      jsonb_build_object(
        'reason', p_error_message, 
        'original_action', v_log.action_type
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
