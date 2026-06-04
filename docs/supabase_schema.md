# Supabase Schema V2 (Enterprise Architecture)

This document outlines the V2 database architecture for the CV-Generator SaaS platform. The architecture has been completely redesigned to support robust enterprise features, including a true credit ledger system, atomic AI logging, and segregated audit logs.

## 1. Core Users & Subscriptions

### `users`
Core user profile synced with Supabase Auth.
- `id` (UUID, PK) - Maps to `auth.users`
- `email` (TEXT, UNIQUE)
- `full_name` (TEXT)
- `avatar_url` (TEXT)
- `credits_balance` (INTEGER) - Current disposable balance
- `preferences` (JSONB) - UI/UX settings
- `created_at`, `updated_at`, `deleted_at`

### `packages`
Subscription tiers offered by the platform.
- `id` (UUID, PK)
- `name` (TEXT) - e.g., 'Pro', 'Premium'
- `code` (TEXT, UNIQUE) - e.g., 'PRO'
- `price` (NUMERIC)
- `currency` (TEXT) - Default 'VND'
- `monthly_credits` (INTEGER)
- `cv_slots`, `cl_slots`, `ats_analysis_limit`, `translation_limit` (INTEGER)
- `is_active` (BOOLEAN)

### `subscriptions`
User's active/past subscriptions.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users)
- `package_id` (UUID, FK -> packages)
- `provider`, `provider_customer_id`, `provider_subscription_id` (TEXT) - Stripe/VNPay metadata
- `status` (TEXT) - ACTIVE, EXPIRED, etc.
- `current_period_start`, `current_period_end` (TIMESTAMPTZ)

### `payments`
Transactions mapping to a subscription invoice or direct credit purchase.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users)
- `amount` (NUMERIC)
- `currency` (TEXT)
- `status` (TEXT) - SUCCESS, FAILED
- `metadata` (JSONB)

## 2. Ledger System

### `credit_transactions` (The Ledger)
A strict double-entry ledger ensuring 100% traceability for credit movements.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users)
- `amount` (INTEGER) - Positive (credits added), Negative (credits spent)
- `balance_after` (INTEGER) - Snapshot of balance after transaction
- `transaction_type` (TEXT) - PENDING_RESERVATION, PURCHASE, REFUND, CV_GENERATION
- `reference_type` (TEXT) - e.g., 'ai_generation_logs'
- `reference_id` (UUID) - ID of the generating entity

## 3. App Data (Profiles & Documents)

### `master_profiles`
Now a **1-to-N** relationship. Users can have multiple base profiles.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users)
- `name` (TEXT) - e.g., "Software Engineer Profile"
- `is_default` (BOOLEAN) - Primary profile used for rapid generation
- `content` (JSONB) - Extracted profile data

### `job_descriptions`
Saved Job Descriptions for tailoring.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users)
- `company`, `title`, `location` (TEXT)
- `content` (TEXT)

### `resumes`
The generated CVs and Cover Letters.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users)
- `profile_id` (UUID, FK -> master_profiles)
- `job_id` (UUID, FK -> job_descriptions)
- `document_type` (TEXT) - 'CV' or 'COVER_LETTER'
- `name` (TEXT)
- `status` (TEXT) - draft, completed

### `resume_versions`
History of edits for a specific resume.
- `id` (UUID, PK)
- `resume_id` (UUID, FK -> resumes)
- `version_number` (INTEGER)
- `content` (JSONB)
- `score` (INTEGER)
- `match_analysis` (JSONB)

## 4. Segregated Logging

### `ai_generation_logs`
Tracks every AI interaction for billing and analytics.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users)
- `action_type` (TEXT) - e.g., 'generate_cv'
- `prompt_tokens`, `completion_tokens`, `total_tokens` (INTEGER)
- `latency_ms` (INTEGER)
- `credits_used` (INTEGER)
- `status` (TEXT) - pending, success, failed

### `audit_logs`
Database mutation tracking (Inserts, Updates, Deletes).
- `id` (UUID, PK)
- `entity_type` (TEXT) - e.g., 'master_profile'
- `action` (TEXT) - e.g., 'UPDATE'
- `old_data`, `new_data` (JSONB)

### `activity_events`
Semantic Application events.
- `id` (UUID, PK)
- `event_name` (TEXT) - e.g., 'APP_AI_GENERATE_CV_SUCCESS'
- `metadata` (JSONB)

### `security_logs`
Authentication and security events.
- `id` (UUID, PK)
- `event_type` (TEXT) - e.g., 'LOGIN_SUCCESS'
- `ip_address`, `user_agent` (TEXT)

## 5. Security & Flow

### Row Level Security (RLS)
All tables now implement strict `auth.uid() = user_id` policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.

### Atomic RPCs
Credits are never manipulated directly from the API. The system uses secure RPCs:
1. `reserve_ai_credits`: Deducts balance upfront, creates a pending `ai_generation_logs` entry, and writes a `PENDING_RESERVATION` to the `credit_transactions` ledger.
2. `finalize_ai_job`: Called by the Inngest worker. If successful, updates the log and ledger. If failed, refunds the user's `credits_balance` and writes a `REFUND` transaction to the ledger.
