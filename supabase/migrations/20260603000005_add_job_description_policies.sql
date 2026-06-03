-- ==========================================
-- ROW LEVEL SECURITY POLICIES FOR JOB DESCRIPTIONS
-- ==========================================

-- Allow users to view their own job descriptions
CREATE POLICY "Users can view their own job descriptions" 
ON public.job_descriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own job descriptions
CREATE POLICY "Users can insert their own job descriptions" 
ON public.job_descriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own job descriptions
CREATE POLICY "Users can update their own job descriptions" 
ON public.job_descriptions FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own job descriptions
CREATE POLICY "Users can delete their own job descriptions" 
ON public.job_descriptions FOR DELETE 
USING (auth.uid() = user_id);
