-- ==========================================
-- UPDATE NEW USER TRIGGER TO INCLUDE MASTER PROFILE
-- ==========================================

-- Replace the existing handle_new_user function to also insert a row in master_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  -- Add master profile creation
  INSERT INTO public.master_profiles (user_id, content)
  VALUES (new.id, '{}'::jsonb);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- ROW LEVEL SECURITY POLICIES FOR MASTER PROFILES
-- ==========================================

-- Enable RLS (Should already be enabled by init schema, but keeping here to be safe)
ALTER TABLE public.master_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own master profile
CREATE POLICY "Users can view their own master profile" 
ON public.master_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own master profile
CREATE POLICY "Users can update their own master profile" 
ON public.master_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Optional: Allow users to insert (just in case they somehow don't have one from the trigger)
CREATE POLICY "Users can insert their own master profile" 
ON public.master_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);
