-- Drop existing policies that might be incorrectly referencing the table name
DROP POLICY IF EXISTS "Users can view their own resume versions" ON public.resume_versions;
DROP POLICY IF EXISTS "Users can insert versions for their own resumes" ON public.resume_versions;
DROP POLICY IF EXISTS "Users can update their own resume versions" ON public.resume_versions;
DROP POLICY IF EXISTS "Users can delete their own resume versions" ON public.resume_versions;

-- Recreate policies with proper implicit column references (NEW/OLD)
CREATE POLICY "Users can view their own resume versions" 
ON public.resume_versions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE resumes.id = resume_id 
    AND resumes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert versions for their own resumes" 
ON public.resume_versions FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE resumes.id = resume_id 
    AND resumes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own resume versions" 
ON public.resume_versions FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE resumes.id = resume_id 
    AND resumes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own resume versions" 
ON public.resume_versions FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE resumes.id = resume_id 
    AND resumes.user_id = auth.uid()
  )
);
