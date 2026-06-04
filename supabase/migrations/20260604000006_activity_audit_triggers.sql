-- Migration: Add audit triggers to critical tables
-- Description: Automatically logs changes to users, subscriptions, master_profiles, and resume_versions into activity_logs.

-- 1. Create a generic audit trigger function
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
DECLARE
    client_ip TEXT;
    action_name TEXT;
    current_user_id UUID;
    actor_type TEXT;
BEGIN
    -- Extract IP address from PostgREST headers if available
    BEGIN
        client_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
    EXCEPTION WHEN OTHERS THEN
        client_ip := NULL;
    END;

    -- Determine actor type (Client vs System)
    IF auth.uid() IS NOT NULL THEN
        actor_type := 'CLIENT';
    ELSE
        actor_type := 'SYSTEM';
    END IF;

    -- Determine the action name based on the table
    action_name := actor_type || '_' || TG_OP || '_' || UPPER(TG_TABLE_NAME);

    -- Extract user_id based on table structure
    IF TG_TABLE_NAME = 'users' THEN
        current_user_id := NEW.id;
    ELSIF TG_TABLE_NAME IN ('subscriptions', 'master_profiles', 'resume_versions') THEN
        -- For resume_versions, we need to join to get user_id, or we can look it up
        IF TG_TABLE_NAME = 'resume_versions' THEN
            SELECT user_id INTO current_user_id FROM resumes WHERE id = NEW.resume_id;
        ELSE
            current_user_id := NEW.user_id;
        END IF;
    END IF;

    -- Only insert log if we could determine the user_id
    IF current_user_id IS NOT NULL THEN
        INSERT INTO activity_logs (
            user_id,
            action,
            previous_state,
            new_state,
            ip_address,
            created_at
        ) VALUES (
            current_user_id,
            action_name,
            row_to_json(OLD)::jsonb,
            row_to_json(NEW)::jsonb,
            client_ip,
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach triggers to tables

-- Trigger for users (to catch credit/slot changes)
DROP TRIGGER IF EXISTS users_audit_trigger ON users;
CREATE TRIGGER users_audit_trigger
    AFTER UPDATE ON users
    FOR EACH ROW
    -- Only log if critical fields changed
    WHEN (OLD.credits IS DISTINCT FROM NEW.credits 
       OR OLD.unlocked_cv_slots IS DISTINCT FROM NEW.unlocked_cv_slots
       OR OLD.unlocked_cl_slots IS DISTINCT FROM NEW.unlocked_cl_slots)
    EXECUTE FUNCTION audit_log_trigger();

-- Trigger for subscriptions
DROP TRIGGER IF EXISTS subscriptions_audit_trigger ON subscriptions;
CREATE TRIGGER subscriptions_audit_trigger
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION audit_log_trigger();

-- Trigger for master_profiles
DROP TRIGGER IF EXISTS master_profiles_audit_trigger ON master_profiles;
CREATE TRIGGER master_profiles_audit_trigger
    AFTER UPDATE ON master_profiles
    FOR EACH ROW
    WHEN (OLD.content IS DISTINCT FROM NEW.content)
    EXECUTE FUNCTION audit_log_trigger();

-- Trigger for resume_versions
DROP TRIGGER IF EXISTS resume_versions_audit_trigger ON resume_versions;
CREATE TRIGGER resume_versions_audit_trigger
    AFTER UPDATE ON resume_versions
    FOR EACH ROW
    WHEN (OLD.content IS DISTINCT FROM NEW.content)
    EXECUTE FUNCTION audit_log_trigger();
