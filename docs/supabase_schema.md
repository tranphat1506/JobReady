# Supabase Database Schema

This document outlines the database schema configured in Supabase migrations.

## Tables

### 1. `users`
Extends the native `auth.users` table to store application-specific user data.
- `id` (UUID, Primary Key) - References `auth.users(id)`
- `email` (TEXT, Unique, Not Null)
- `full_name` (TEXT)
- `preferences` (JSONB) - Default: `{}`
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 2. `packages`
Subscription packages available in the system.
- `id` (UUID, Primary Key)
- `name` (TEXT, Not Null)
- `price` (INTEGER, Not Null)
- `generation_limit` (INTEGER, Not Null)
- `is_active` (BOOLEAN) - Default: `true`
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 3. `subscriptions`
Tracks user subscriptions.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Not Null) - References `users(id)`
- `package_id` (UUID, Not Null) - References `packages(id)`
- `provider` (TEXT)
- `provider_subscription_id` (TEXT)
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
- `cost_usd` (DECIMAL, Not Null)
- `created_at` (TIMESTAMPTZ)

### 9. `activity_logs`
System activity audit log.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Not Null) - References `users(id)`
- `action` (TEXT, Not Null)
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

## Security (Row Level Security)
RLS is enabled on all tables by default. Policies restrict access so that users can only read/write their own records based on `user_id`.
