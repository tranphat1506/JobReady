-- 1. Create B-Tree Indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_status ON public.resumes(user_id, status);
CREATE INDEX IF NOT EXISTS idx_resumes_user_type ON public.resumes(user_id, type);
CREATE INDEX IF NOT EXISTS idx_master_profiles_user_id ON public.master_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_user_id ON public.ai_generation_logs(user_id);

-- 2. Create RPC for Deducting Credits and Saving AI Logs atomically
-- This procedure will deduct credits, and insert the AI generation log in a single transaction.
-- It returns a boolean indicating success.

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
    user_id, action_type, model_used, tokens_prompt, tokens_completion, cost_usd, latency_ms, status
  ) VALUES (
    p_user_id, p_action_type, p_model_used, p_prompt_tokens, p_completion_tokens, 0, p_latency_ms, 'success'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
