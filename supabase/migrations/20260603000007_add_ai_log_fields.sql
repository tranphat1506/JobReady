-- Add new columns to ai_generation_logs
ALTER TABLE public.ai_generation_logs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'success';
ALTER TABLE public.ai_generation_logs ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE public.ai_generation_logs ADD COLUMN IF NOT EXISTS latency_ms INTEGER;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own AI logs" ON public.ai_generation_logs;
DROP POLICY IF EXISTS "Users can insert their own AI logs" ON public.ai_generation_logs;
DROP POLICY IF EXISTS "Service role can insert AI logs" ON public.ai_generation_logs;

-- Enable RLS
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own logs
CREATE POLICY "Users can view their own AI logs" 
ON public.ai_generation_logs FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users (via API with authenticated user) to insert logs
CREATE POLICY "Users can insert their own AI logs" 
ON public.ai_generation_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add index for faster history fetching
CREATE INDEX IF NOT EXISTS ai_generation_logs_user_id_idx ON public.ai_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS ai_generation_logs_created_at_idx ON public.ai_generation_logs(created_at DESC);
