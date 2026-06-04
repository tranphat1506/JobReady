CREATE OR REPLACE FUNCTION reserve_ai_credits(
  p_user_id UUID,
  p_cost INTEGER,
  p_action_type TEXT
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

  -- 1. Deduct upfront
  UPDATE users
  SET credits_balance = credits_balance - p_cost
  WHERE id = p_user_id;

  -- 2. Create pending AI log
  INSERT INTO ai_generation_logs (
    user_id, action_type, status, credits_used,
    prompt_tokens, completion_tokens, total_tokens, latency_ms, model_used
  ) VALUES (
    p_user_id, p_action_type, 'pending', p_cost,
    0, 0, 0, 0, 'unknown'
  ) RETURNING id INTO v_log_id;

  -- 3. Write to Ledger
  INSERT INTO credit_transactions (
    user_id, amount, balance_after, transaction_type, reference_type, reference_id
  ) VALUES (
    p_user_id, -p_cost, v_current_credits - p_cost, 'PENDING_RESERVATION', 'ai_generation_logs', v_log_id
  );

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION finalize_ai_job(
  p_log_id UUID,
  p_success BOOLEAN,
  p_prompt_tokens INTEGER DEFAULT 0,
  p_completion_tokens INTEGER DEFAULT 0,
  p_latency_ms INTEGER DEFAULT 0,
  p_model_used TEXT DEFAULT 'unknown',
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
        model_used = p_model_used
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
        model_used = p_model_used
    WHERE id = p_log_id;
    
    -- Write Refund to Ledger
    INSERT INTO credit_transactions (
      user_id, amount, balance_after, transaction_type, reference_type, reference_id
    ) VALUES (
      v_log.user_id, v_log.credits_used, v_current_credits, 'REFUND', 'ai_generation_logs', p_log_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
