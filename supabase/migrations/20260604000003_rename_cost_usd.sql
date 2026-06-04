-- Rename cost_usd to credits_used
ALTER TABLE public.ai_generation_logs RENAME COLUMN cost_usd TO credits_used;

-- Update the RPC to insert p_cost into credits_used instead of 0
CREATE OR REPLACE FUNCTION public.log_ai_and_deduct_credits(
  p_user_id UUID,
  p_cost INTEGER,
  p_action_type TEXT,
  p_model_used TEXT,
  p_prompt_tokens INTEGER,
  p_completion_tokens INTEGER,
  p_latency_ms INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  -- Check current credits and lock the row
  SELECT credits INTO v_current_credits
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_credits < p_cost THEN
    RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', p_cost, v_current_credits;
  END IF;

  -- Deduct credits if cost > 0
  IF p_cost > 0 THEN
    UPDATE public.users
    SET credits = credits - p_cost
    WHERE id = p_user_id;
  END IF;

  -- Insert Log
  INSERT INTO public.ai_generation_logs (
    user_id, action_type, model_used, tokens_prompt, tokens_completion, credits_used, latency_ms, status
  ) VALUES (
    p_user_id, p_action_type, p_model_used, p_prompt_tokens, p_completion_tokens, p_cost, p_latency_ms, 'success'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
