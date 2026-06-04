-- Enable Supabase Realtime for key tables
-- This allows the frontend to subscribe to INSERT/UPDATE events via WebSockets

-- Enable Realtime on ai_generation_logs table
-- (Used to signal the frontend when background AI generation is complete)
ALTER TABLE public.ai_generation_logs REPLICA IDENTITY FULL;

-- Enable Realtime on resumes table
-- (Used to signal the frontend when a new resume is created)
ALTER TABLE public.resumes REPLICA IDENTITY FULL;

-- Enable Realtime on master_profiles table
-- (Used to signal the frontend when profile parsing is complete)
ALTER TABLE public.master_profiles REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication
-- Note: If the publication doesn't exist yet, Supabase creates it by default.
-- We just need to add tables to it.
DO $$
BEGIN
  -- Add ai_generation_logs to realtime publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'ai_generation_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_generation_logs;
  END IF;

  -- Add resumes to realtime publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'resumes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.resumes;
  END IF;

  -- Add master_profiles to realtime publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'master_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.master_profiles;
  END IF;
END $$;
