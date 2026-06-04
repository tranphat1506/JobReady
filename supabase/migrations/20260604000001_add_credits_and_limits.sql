-- 1. Modify users table to add credits
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 10;

-- 2. Modify packages table to add limits
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS cv_slot_limit INTEGER NOT NULL DEFAULT 2;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS cl_slot_limit INTEGER NOT NULL DEFAULT 2;

-- 3. Ensure a "Free" package exists
INSERT INTO public.packages (name, price, generation_limit, cv_slot_limit, cl_slot_limit, is_active)
SELECT 'Free', 0, 10, 2, 2, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.packages WHERE name = 'Free'
);

-- 4. Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
-- Anyone can read settings, only admin can update (in the future)
CREATE POLICY "Allow public read on system_settings" ON public.system_settings FOR SELECT USING (true);

-- Insert default settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
  ('price_generate_cv', '0'::jsonb, 'Credits cost for generating CV'),
  ('price_generate_cl', '0'::jsonb, 'Credits cost for generating Cover Letter'),
  ('price_parse_profile', '0'::jsonb, 'Credits cost for parsing profile from CV text')
ON CONFLICT (key) DO NOTHING;

-- 5. Update handle_new_user trigger to assign Free package
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  free_package_id UUID;
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email, full_name, credits)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 10);
  
  -- Get Free package ID
  SELECT id INTO free_package_id FROM public.packages WHERE name = 'Free' LIMIT 1;
  
  -- Create a free subscription for the new user
  IF free_package_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (user_id, package_id, status, start_date, end_date)
    VALUES (new.id, free_package_id, 'ACTIVE', now(), now() + interval '100 years');
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
