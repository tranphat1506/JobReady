-- Migration: Add message_code to credit_transactions
-- Date: 2026-06-05

ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS message_code VARCHAR(100);

-- Redefine buy_slot
DROP FUNCTION IF EXISTS buy_slot(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS buy_slot(UUID, TEXT, INTEGER, VARCHAR);

CREATE OR REPLACE FUNCTION buy_slot(
    p_user_id UUID,
    p_slot_type TEXT,
    p_cost INTEGER,
    p_message_code VARCHAR(100) DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    SELECT credits_balance INTO v_balance
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF v_balance < p_cost THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;

    UPDATE users
    SET credits_balance = credits_balance - p_cost
    WHERE id = p_user_id;

    IF p_slot_type = 'cv' THEN
        UPDATE users SET extra_cv_slots = extra_cv_slots + 1 WHERE id = p_user_id;
    ELSIF p_slot_type = 'cl' THEN
        UPDATE users SET extra_cl_slots = extra_cl_slots + 1 WHERE id = p_user_id;
    ELSE
        RAISE EXCEPTION 'Invalid slot type. Must be cv or cl';
    END IF;

    INSERT INTO credit_transactions (
        user_id,
        amount,
        balance_after,
        transaction_type,
        reference_type,
        message_code
    ) VALUES (
        p_user_id,
        -p_cost,
        v_balance - p_cost,
        'PURCHASE_SLOT',
        p_slot_type,
        p_message_code
    );
END;
$$;

-- Redefine reserve_ai_credits
DROP FUNCTION IF EXISTS reserve_ai_credits(UUID, INTEGER, TEXT, JSONB);
DROP FUNCTION IF EXISTS reserve_ai_credits(UUID, INTEGER, TEXT, JSONB, VARCHAR);

CREATE OR REPLACE FUNCTION reserve_ai_credits(
  p_user_id UUID,
  p_cost INTEGER,
  p_action_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_message_code VARCHAR(100) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_current_credits INTEGER;
  v_log_id UUID;
BEGIN
  SELECT credits_balance INTO v_current_credits
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_credits < p_cost THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  UPDATE users
  SET credits_balance = credits_balance - p_cost
  WHERE id = p_user_id;

  INSERT INTO ai_generation_logs (
    user_id, action_type, status, credits_used,
    prompt_tokens, completion_tokens, total_tokens, latency_ms, model_used
  ) VALUES (
    p_user_id, p_action_type, 'pending', p_cost,
    0, 0, 0, 0, 'unknown'
  ) RETURNING id INTO v_log_id;

  INSERT INTO credit_transactions (
    user_id, amount, balance_after, transaction_type, reference_type, reference_id, metadata, message_code
  ) VALUES (
    p_user_id, -p_cost, v_current_credits - p_cost, 'PENDING_RESERVATION', 'ai_generation_logs', v_log_id, p_metadata, p_message_code
  );

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redefine finalize_ai_job
DROP FUNCTION IF EXISTS finalize_ai_job(UUID, BOOLEAN, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS finalize_ai_job(UUID, BOOLEAN, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT, VARCHAR, VARCHAR);

CREATE OR REPLACE FUNCTION finalize_ai_job(
  p_log_id UUID,
  p_success BOOLEAN,
  p_prompt_tokens INTEGER DEFAULT 0,
  p_completion_tokens INTEGER DEFAULT 0,
  p_latency_ms INTEGER DEFAULT 0,
  p_model_used TEXT DEFAULT 'unknown',
  p_provider TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_success_message_code VARCHAR(100) DEFAULT NULL,
  p_refund_message_code VARCHAR(100) DEFAULT NULL
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
    
    UPDATE credit_transactions 
    SET transaction_type = v_log.action_type,
        message_code = COALESCE(p_success_message_code, message_code)
    WHERE reference_id = p_log_id AND transaction_type = 'PENDING_RESERVATION';

  ELSE
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
    
    INSERT INTO credit_transactions (
      user_id, amount, balance_after, transaction_type, reference_type, reference_id, metadata, message_code
    ) VALUES (
      v_log.user_id, v_log.credits_used, v_current_credits, 'REFUND', 'ai_generation_logs', p_log_id,
      jsonb_build_object(
        'reason', 'system_failure', 
        'original_action', v_log.action_type
      ),
      p_refund_message_code
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
