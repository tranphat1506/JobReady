-- 1. Add slot columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS unlocked_cv_slots INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS unlocked_cl_slots INTEGER NOT NULL DEFAULT 1;

-- 2. Drop slot limit columns from packages table
ALTER TABLE public.packages 
DROP COLUMN IF EXISTS cv_slot_limit,
DROP COLUMN IF EXISTS cl_slot_limit;

-- 3. Add default pricing settings for slots to system_settings if they don't exist
INSERT INTO public.system_settings (key, value, description)
VALUES 
  ('price_cv_slot', '50', 'Credit cost to purchase a new CV slot'),
  ('price_cl_slot', '30', 'Credit cost to purchase a new Cover Letter slot')
ON CONFLICT (key) DO NOTHING;

-- 4. Create an RPC to safely purchase a slot transactionally
CREATE OR REPLACE FUNCTION public.buy_slot(
  p_user_id UUID,
  p_slot_type TEXT, -- 'cv' or 'cl'
  p_cost INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  -- Lock the user row to prevent race conditions
  SELECT credits INTO v_current_credits
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_credits < p_cost THEN
    RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', p_cost, v_current_credits;
  END IF;

  -- Deduct credits
  UPDATE public.users
  SET credits = credits - p_cost
  WHERE id = p_user_id;

  -- Add slot
  IF p_slot_type = 'cv' THEN
    UPDATE public.users
    SET unlocked_cv_slots = unlocked_cv_slots + 1
    WHERE id = p_user_id;
  ELSIF p_slot_type = 'cl' THEN
    UPDATE public.users
    SET unlocked_cl_slots = unlocked_cl_slots + 1
    WHERE id = p_user_id;
  ELSE
    RAISE EXCEPTION 'Invalid slot type. Must be "cv" or "cl"';
  END IF;

  -- Insert Log for the purchase
  INSERT INTO public.activity_logs (
    user_id, action, previous_state, new_state
  ) VALUES (
    p_user_id, 
    'PURCHASE_SLOT', 
    jsonb_build_object('credits', v_current_credits, 'type', p_slot_type), 
    jsonb_build_object('credits', v_current_credits - p_cost, 'type', p_slot_type, 'cost', p_cost)
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
