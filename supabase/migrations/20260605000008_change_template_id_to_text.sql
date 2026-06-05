-- Drop the foreign key constraint
ALTER TABLE "public"."resumes" DROP CONSTRAINT IF EXISTS resumes_template_id_fkey;

-- Change template_id from UUID to TEXT
ALTER TABLE "public"."resumes" ALTER COLUMN template_id TYPE TEXT USING template_id::text;
