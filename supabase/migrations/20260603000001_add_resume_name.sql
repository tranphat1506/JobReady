-- Add name column to resumes table to support document naming and flat storage
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Untitled Document';
