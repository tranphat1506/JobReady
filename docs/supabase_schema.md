# Supabase Database Schema

This document outlines the database schema configured in Supabase migrations.

## Tables

### 1. `users`
Extends the native `auth.users` table to store application-specific user data.
- `id` (UUID, Primary Key) - References `auth.users(id)`
- `email` (TEXT, Unique, Not Null)
- `full_name` (TEXT)
- `preferences` (JSONB) - Default: `{}`
- `unlocked_cv_slots` (INTEGER) - Default: `1`
- `unlocked_cl_slots` (INTEGER) - Default: `1`
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 2. `packages`
Subscription packages available in the system.
- `id` (UUID, Primary Key)
- `name` (TEXT, Not Null)
- `price` (DECIMAL)
- `credits_per_month` (INTEGER)
- `is_active` (BOOLEAN) - Default: `true`
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 3. `subscriptions`
Tracks user subscriptions.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Not Null) - References `users(id)`
- `package_id` (UUID, Not Null) - References `packages(id)`
- `stripe_customer_id` (TEXT)
- `stripe_subscription_id` (TEXT)
- `status` (TEXT, Not Null) - Default: `ACTIVE`
- `start_date` (TIMESTAMPTZ)
- `end_date` (TIMESTAMPTZ, Not Null)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 4. `master_profiles`
Stores the user's master profile JSON data.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Not Null) - References `users(id)`
- `content` (JSONB) - Default: `{}` (Note: The JSON schema follows CVSchema)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 5. `job_descriptions`
Stores job descriptions that users input for tailoring their CVs.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Not Null) - References `users(id)`
- `company` (TEXT)
- `title` (TEXT)
- `content` (TEXT, Not Null)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 6. `resumes`
Metadata for generated tailored CVs/Cover Letters.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Not Null) - References `users(id)`
- `profile_id` (UUID, Not Null) - References `master_profiles(id)`
- `job_id` (UUID) - References `job_descriptions(id)` (Nullable)
- `type` (TEXT, Not Null)
- `name` (TEXT) - Name of the document (Nullable)
- `status` (TEXT) - e.g. 'draft', 'completed' (Default: 'draft')
- `template_id` (TEXT) - Selected layout template (Nullable)
- `metadata` (JSONB) - Additional info like language, tone (Default: '{}')
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 7. `resume_versions`
Stores the actual generated JSON content for a resume.
- `id` (UUID, Primary Key)
- `resume_id` (UUID, Not Null) - References `resumes(id)`
- `content` (JSONB, Not Null)
- `score` (INTEGER) - General match score (Nullable)
- `match_analysis` (JSONB) - Detailed match object (isRelevant, missingSkills, feedback)
- `created_at` (TIMESTAMPTZ)

### 8. `ai_generation_logs`
Tracks AI usage for analytics and billing.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Not Null) - References `users(id)`
- `action_type` (TEXT, Not Null)
- `model_used` (TEXT, Not Null)
- `tokens_prompt` (INTEGER, Not Null)
- `tokens_completion` (INTEGER, Not Null)
- `credits_used` (INTEGER, Not Null)
- `created_at` (TIMESTAMPTZ)

### 9. `activity_logs`
System activity audit log. Automatically populated via Postgres Triggers to track data changes, and via App layer for network/user context.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Not Null) - References `users(id)`
- `action` (TEXT, Not Null) - Formats: `CLIENT_UPDATE_USERS`, `SYSTEM_UPDATE_USERS`, `APP_INITIATE_CHECKOUT`
- `previous_state` (JSONB)
- `new_state` (JSONB)
- `ip_address` (TEXT)
- `created_at` (TIMESTAMPTZ)

### 10. `webhook_events`
- `id` (UUID, Primary Key)
- `provider` (TEXT, Not Null)
- `event_id` (TEXT, Unique, Not Null)
- `payload` (JSONB, Not Null)
- `status` (TEXT, Not Null) - Default: `PENDING`
- `processed_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

## Views

### 1. `user_service_usages_view`
Secure view built on top of `ai_generation_logs` to hide internal AI metrics (model, tokens, latency) from the client application.
- Exposes: `id`, `user_id`, `action_type`, `status`, `error_message`, `created_at`, `credits_used`
- Security: Uses `security_invoker=on` to inherit table RLS.

## Security (Row Level Security & Triggers)

### Row Level Security
RLS is enabled on all tables by default. Policies restrict access so that users can only read/write their own records based on `user_id`.

### Audit Triggers
Postgres Triggers are configured on critical tables to automatically record state changes into `activity_logs`:
- **`users`**: Logs changes to `credits`, `unlocked_cv_slots`, `unlocked_cl_slots`.
- **`subscriptions`**: Logs any insert or update (e.g., plan upgrades, cancellations).
- **`master_profiles` & `resume_versions`**: Logs modifications to the `content` JSON to allow full document rollback.
