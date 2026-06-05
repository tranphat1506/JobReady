-- Add extra slots to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS extra_cv_slots INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS extra_cl_slots INTEGER DEFAULT 0;

-- Drop the old buy_slot if it exists (for safety)
DROP FUNCTION IF EXISTS buy_slot(UUID, TEXT, INTEGER);

-- Create the new buy_slot RPC
CREATE OR REPLACE FUNCTION buy_slot(
    p_user_id UUID,
    p_slot_type TEXT,
    p_cost INTEGER
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    -- Get current balance with row-level lock
    SELECT credits_balance INTO v_balance
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Check if user has enough credits
    IF v_balance < p_cost THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;

    -- Deduct credits
    UPDATE users
    SET credits_balance = credits_balance - p_cost
    WHERE id = p_user_id;

    -- Increment extra slot
    IF p_slot_type = 'cv' THEN
        UPDATE users SET extra_cv_slots = extra_cv_slots + 1 WHERE id = p_user_id;
    ELSIF p_slot_type = 'cl' THEN
        UPDATE users SET extra_cl_slots = extra_cl_slots + 1 WHERE id = p_user_id;
    ELSE
        RAISE EXCEPTION 'Invalid slot type. Must be cv or cl';
    END IF;

    -- Record transaction in ledger
    INSERT INTO credit_transactions (
        user_id,
        amount,
        balance_after,
        transaction_type,
        reference_type
    ) VALUES (
        p_user_id,
        -p_cost,
        v_balance - p_cost,
        'PURCHASE_SLOT',
        p_slot_type
    );
END;
$$;
