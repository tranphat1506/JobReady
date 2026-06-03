-- Add status to resumes table
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
