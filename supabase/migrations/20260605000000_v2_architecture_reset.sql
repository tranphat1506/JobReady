-- V2 Architecture Reset
-- WARNING: This migration DROPS existing tables and recreates the entire schema based on V2 requirements.

-- 1. Clean Slate (Drop existing structures)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.reserve_ai_credits(UUID, NUMERIC, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.finalize_ai_job(UUID, BOOLEAN, INTEGER, INTEGER, INTEGER, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.log_ai_and_deduct_credits(UUID, NUMERIC, TEXT, TEXT, INTEGER, INTEGER, INTEGER) CASCADE;

DROP TABLE IF EXISTS "public"."user_usage_monthly" CASCADE;
DROP TABLE IF EXISTS "public"."webhook_events" CASCADE;
DROP TABLE IF EXISTS "public"."security_logs" CASCADE;
DROP TABLE IF EXISTS "public"."activity_events" CASCADE;
DROP TABLE IF EXISTS "public"."audit_logs" CASCADE;
DROP TABLE IF EXISTS "public"."ai_generation_logs" CASCADE;
DROP TABLE IF EXISTS "public"."resume_exports" CASCADE;
DROP TABLE IF EXISTS "public"."resume_versions" CASCADE;
DROP TABLE IF EXISTS "public"."resumes" CASCADE;
DROP TABLE IF EXISTS "public"."templates" CASCADE;
DROP TABLE IF EXISTS "public"."job_descriptions" CASCADE;
DROP TABLE IF EXISTS "public"."master_profiles" CASCADE;
DROP TABLE IF EXISTS "public"."credit_transactions" CASCADE;
DROP TABLE IF EXISTS "public"."payments" CASCADE;
DROP TABLE IF EXISTS "public"."subscriptions" CASCADE;
DROP TABLE IF EXISTS "public"."packages" CASCADE;
DROP TABLE IF EXISTS "public"."system_settings" CASCADE;
DROP TABLE IF EXISTS "public"."users" CASCADE;
DROP TABLE IF EXISTS "public"."activity_logs" CASCADE;

-- 2. Core Users
CREATE TABLE "public"."users" (
    "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    "email" TEXT UNIQUE NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "credits_balance" INTEGER DEFAULT 500, -- Free tier initial credits
    "preferences" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    "deleted_at" TIMESTAMPTZ
);

-- 3. Subscription Plans
CREATE TABLE "public"."packages" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT UNIQUE NOT NULL,
    "price" NUMERIC NOT NULL,
    "currency" TEXT DEFAULT 'VND',
    "monthly_credits" INTEGER NOT NULL,
    "cv_slots" INTEGER NOT NULL,
    "cl_slots" INTEGER NOT NULL,
    "ats_analysis_limit" INTEGER NOT NULL,
    "translation_limit" INTEGER NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Packages
INSERT INTO "public"."packages" (name, code, price, monthly_credits, cv_slots, cl_slots, ats_analysis_limit, translation_limit)
VALUES 
('Free', 'FREE', 0, 100, 1, 1, 0, 0),
('Pro', 'PRO', 99000, 1000, 5, 5, 10, 10),
('Premium', 'PREMIUM', 199000, 3000, 20, 20, 50, 50);

-- 4. User Subscription
CREATE TABLE "public"."subscriptions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "public"."users"(id) ON DELETE CASCADE NOT NULL,
    "package_id" UUID REFERENCES "public"."packages"(id) ON DELETE RESTRICT NOT NULL,
    "provider" TEXT,
    "provider_customer_id" TEXT,
    "provider_subscription_id" TEXT,
    "status" TEXT NOT NULL, -- ACTIVE, TRIALING, PAST_DUE, CANCELED, EXPIRED
    "current_period_start" TIMESTAMPTZ,
    "current_period_end" TIMESTAMPTZ,
    "cancel_at_period_end" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Payments
CREATE TABLE "public"."payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "public"."users"(id) ON DELETE CASCADE NOT NULL,
    "subscription_id" UUID REFERENCES "public"."subscriptions"(id) ON DELETE SET NULL,
    "provider" TEXT,
    "provider_transaction_id" TEXT,
    "amount" NUMERIC NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL, -- PENDING, SUCCESS, FAILED, REFUNDED
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Credit Ledger
CREATE TABLE "public"."credit_transactions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "public"."users"(id) ON DELETE CASCADE NOT NULL,
    "amount" INTEGER NOT NULL, -- positive for credit, negative for debit
    "balance_after" INTEGER NOT NULL,
    "transaction_type" TEXT NOT NULL, -- PURCHASE, BONUS, CV_GENERATION, REFUND, PENDING_RESERVATION
    "reference_type" TEXT,
    "reference_id" UUID,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 7. App Data: Profiles, JDs, Templates, Resumes
CREATE TABLE "public"."master_profiles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "public"."users"(id) ON DELETE CASCADE NOT NULL,
    "name" TEXT NOT NULL,
    "is_default" BOOLEAN DEFAULT FALSE,
    "content" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    "deleted_at" TIMESTAMPTZ
);

CREATE TABLE "public"."job_descriptions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "public"."users"(id) ON DELETE CASCADE NOT NULL,
    "company" TEXT,
    "title" TEXT,
    "location" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    "deleted_at" TIMESTAMPTZ
);

CREATE TABLE "public"."templates" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "category" TEXT,
    "thumbnail_url" TEXT,
    "preview_url" TEXT,
    "is_premium" BOOLEAN DEFAULT FALSE,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "public"."resumes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "public"."users"(id) ON DELETE CASCADE NOT NULL,
    "profile_id" UUID REFERENCES "public"."master_profiles"(id) ON DELETE SET NULL,
    "job_id" UUID REFERENCES "public"."job_descriptions"(id) ON DELETE SET NULL,
    "template_id" UUID REFERENCES "public"."templates"(id) ON DELETE SET NULL,
    "document_type" TEXT NOT NULL, -- CV, COVER_LETTER
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    "deleted_at" TIMESTAMPTZ
);

CREATE TABLE "public"."resume_versions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "resume_id" UUID REFERENCES "public"."resumes"(id) ON DELETE CASCADE NOT NULL,
    "version_number" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "score" INTEGER,
    "match_analysis" JSONB,
    "ai_model" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "public"."resume_exports" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "resume_id" UUID REFERENCES "public"."resumes"(id) ON DELETE CASCADE NOT NULL,
    "format" TEXT NOT NULL, -- PDF, DOCX, JSON
    "file_url" TEXT,
    "exported_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Logging & Analytics
CREATE TABLE "public"."ai_generation_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "public"."users"(id) ON DELETE CASCADE NOT NULL,
    "action_type" TEXT NOT NULL,
    "provider" TEXT,
    "model_used" TEXT,
    "prompt_tokens" INTEGER,
    "completion_tokens" INTEGER,
    "total_tokens" INTEGER,
    "latency_ms" INTEGER,
    "cost_usd" NUMERIC,
    "credits_used" INTEGER,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "public"."audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "public"."users"(id) ON DELETE SET NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "action" TEXT NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "public"."activity_events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "public"."users"(id) ON DELETE CASCADE NOT NULL,
    "event_name" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "public"."security_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "public"."users"(id) ON DELETE SET NULL,
    "event_type" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "public"."webhook_events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "event_id" TEXT UNIQUE NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "processed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "public"."user_usage_monthly" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "public"."users"(id) ON DELETE CASCADE NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "cv_generated" INTEGER DEFAULT 0,
    "cl_generated" INTEGER DEFAULT 0,
    "translations" INTEGER DEFAULT 0,
    "ats_analysis" INTEGER DEFAULT 0,
    "credits_spent" INTEGER DEFAULT 0,
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("user_id", "year", "month")
);

-- 9. Auth Trigger (Recreate)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, credits_balance)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    500 -- Free credits
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Ledger-based Credit Reservation & Refund System
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
    
    -- Update Ledger to finalize the transaction type (optional, but good for reporting)
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

-- 11. Minimal RLS (Enable for all, user access only)
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."packages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."credit_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."master_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."job_descriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."resumes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."resume_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."resume_exports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ai_generation_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."activity_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."security_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."webhook_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_usage_monthly" ENABLE ROW LEVEL SECURITY;

-- Basic user access policies
CREATE POLICY "Users can view own data" ON "public"."users" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON "public"."users" FOR UPDATE USING (auth.uid() = id);

-- Public Packages/Templates
CREATE POLICY "Public read packages" ON "public"."packages" FOR SELECT USING (true);
CREATE POLICY "Public read templates" ON "public"."templates" FOR SELECT USING (true);

-- Utility function to auto-create standard policies for user-owned tables
CREATE OR REPLACE FUNCTION create_user_policies(table_name TEXT) RETURNS VOID AS $$
BEGIN
  EXECUTE format('CREATE POLICY "Users can select own %I" ON "public".%I FOR SELECT USING (auth.uid() = user_id);', table_name, table_name);
  EXECUTE format('CREATE POLICY "Users can insert own %I" ON "public".%I FOR INSERT WITH CHECK (auth.uid() = user_id);', table_name, table_name);
  EXECUTE format('CREATE POLICY "Users can update own %I" ON "public".%I FOR UPDATE USING (auth.uid() = user_id);', table_name, table_name);
  EXECUTE format('CREATE POLICY "Users can delete own %I" ON "public".%I FOR DELETE USING (auth.uid() = user_id);', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

SELECT create_user_policies('subscriptions');
SELECT create_user_policies('payments');
SELECT create_user_policies('credit_transactions');
SELECT create_user_policies('master_profiles');
SELECT create_user_policies('job_descriptions');
SELECT create_user_policies('resumes');
SELECT create_user_policies('ai_generation_logs');
SELECT create_user_policies('activity_events');
SELECT create_user_policies('user_usage_monthly');

-- Special nested policies
CREATE POLICY "Users can view own resume versions" ON "public"."resume_versions" FOR SELECT 
USING (resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own resume versions" ON "public"."resume_versions" FOR INSERT 
WITH CHECK (resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own resume exports" ON "public"."resume_exports" FOR SELECT 
USING (resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid()));

-- Clean up utility function
DROP FUNCTION create_user_policies(TEXT);

-- 12. Enable Realtime for necessary tables
-- (Required for the frontend to listen to AI background task completions)
ALTER PUBLICATION supabase_realtime ADD TABLE master_profiles;
