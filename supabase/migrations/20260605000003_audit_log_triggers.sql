-- Create a generic trigger function for logging to audit_logs
CREATE OR REPLACE FUNCTION capture_audit_log() RETURNS trigger AS $$
BEGIN
  INSERT INTO "public"."audit_logs" (entity_type, entity_id, action, old_data, new_data)
  VALUES (
    TG_TABLE_NAME, 
    COALESCE(NEW.id, OLD.id), 
    TG_OP, 
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD)::jsonb END, 
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW)::jsonb END
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to master_profiles
DROP TRIGGER IF EXISTS audit_master_profiles_trigger ON "public"."master_profiles";
CREATE TRIGGER audit_master_profiles_trigger
AFTER INSERT OR UPDATE OR DELETE ON "public"."master_profiles"
FOR EACH ROW EXECUTE FUNCTION capture_audit_log();

-- Attach trigger to resumes
DROP TRIGGER IF EXISTS audit_resumes_trigger ON "public"."resumes";
CREATE TRIGGER audit_resumes_trigger
AFTER INSERT OR UPDATE OR DELETE ON "public"."resumes"
FOR EACH ROW EXECUTE FUNCTION capture_audit_log();

-- Attach trigger to job_descriptions
DROP TRIGGER IF EXISTS audit_job_descriptions_trigger ON "public"."job_descriptions";
CREATE TRIGGER audit_job_descriptions_trigger
AFTER INSERT OR UPDATE OR DELETE ON "public"."job_descriptions"
FOR EACH ROW EXECUTE FUNCTION capture_audit_log();
