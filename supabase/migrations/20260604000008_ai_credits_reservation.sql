-- Migration: AI Credits Reservation System
-- Description: Creates atomic RPCs for deducting credits BEFORE AI execution and refunding if failed.

-- 1. Reserve Credits Function
CREATE OR REPLACE FUNCTION reserve_ai_credits(
  p_user_id UUID,
  p_cost NUMERIC,
  p_action_type TEXT
) RETURNS UUID AS $$
DECLARE
  v_current_credits NUMERIC;
  v_log_id UUID;
BEGIN
  -- Get lock on user row to prevent race conditions during concurrent requests
  SELECT credits INTO v_current_credits
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_credits < p_cost THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Deduct upfront
  UPDATE users
  SET credits = credits - p_cost
  WHERE id = p_user_id;

  -- Create pending log
  INSERT INTO ai_generation_logs (
    user_id, action_type, status, credits_used,
    tokens_prompt, tokens_completion, latency_ms, model_used
  ) VALUES (
    p_user_id, p_action_type, 'pending', p_cost,
    0, 0, 0, 'unknown'
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Finalize AI Job Function (Success or Refund)
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
BEGIN
  -- Lock log row
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
        tokens_prompt = p_prompt_tokens,
        tokens_completion = p_completion_tokens,
        latency_ms = p_latency_ms,
        model_used = p_model_used
    WHERE id = p_log_id;
  ELSE
    -- Refund
    UPDATE users
    SET credits = credits + v_log.credits_used
    WHERE id = v_log.user_id;

    UPDATE ai_generation_logs
    SET status = 'failed',
        error_message = p_error_message,
        tokens_prompt = p_prompt_tokens,
        tokens_completion = p_completion_tokens,
        latency_ms = p_latency_ms,
        model_used = p_model_used
    WHERE id = p_log_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
