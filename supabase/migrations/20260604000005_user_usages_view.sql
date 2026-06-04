-- Create a view to hide sensitive AI execution details (model, tokens, latency) from the client
CREATE OR REPLACE VIEW user_service_usages_view WITH (security_invoker=on) AS
SELECT 
    id,
    user_id,
    action_type,
    status,
    error_message,
    created_at,
    credits_used
FROM ai_generation_logs;

-- Grant permissions to authenticated users to select from the view
GRANT SELECT ON user_service_usages_view TO authenticated;
