-- ==========================================
-- ROW LEVEL SECURITY POLICIES FOR RESUMES
-- ==========================================

-- Allow users to view their own resumes
CREATE POLICY "Users can view their own resumes" 
ON public.resumes FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own resumes
CREATE POLICY "Users can insert their own resumes" 
ON public.resumes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own resumes
CREATE POLICY "Users can update their own resumes" 
ON public.resumes FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own resumes
CREATE POLICY "Users can delete their own resumes" 
ON public.resumes FOR DELETE 
USING (auth.uid() = user_id);

-- ==========================================
-- ROW LEVEL SECURITY POLICIES FOR RESUME VERSIONS
-- ==========================================

-- Allow users to view versions of their own resumes
CREATE POLICY "Users can view their own resume versions" 
ON public.resume_versions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE resumes.id = resume_versions.resume_id 
    AND resumes.user_id = auth.uid()
  )
);

-- Allow users to insert versions for their own resumes
CREATE POLICY "Users can insert versions for their own resumes" 
ON public.resume_versions FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE resumes.id = resume_versions.resume_id 
    AND resumes.user_id = auth.uid()
  )
);

-- Allow users to update versions of their own resumes
CREATE POLICY "Users can update their own resume versions" 
ON public.resume_versions FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE resumes.id = resume_versions.resume_id 
    AND resumes.user_id = auth.uid()
  )
);

-- Allow users to delete versions of their own resumes
CREATE POLICY "Users can delete their own resume versions" 
ON public.resume_versions FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE resumes.id = resume_versions.resume_id 
    AND resumes.user_id = auth.uid()
  )
);
