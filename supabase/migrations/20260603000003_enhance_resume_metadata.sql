-- Add template_id and metadata to resumes table
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS template_id TEXT;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add match_analysis to resume_versions table
ALTER TABLE public.resume_versions ADD COLUMN IF NOT EXISTS match_analysis JSONB;
