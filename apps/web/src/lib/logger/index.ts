import { createClient } from "@supabase/supabase-js";
import { ActivityEvent, SecurityEvent } from "@/lib/constants/events";

// Instantiate the admin client for logging to bypass RLS
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const AppLogger = {
  /**
   * Tracks an application-level semantic event (e.g. CV Created)
   */
  trackActivity: async (userId: string, eventName: ActivityEvent, metadata?: any) => {
    try {
      await adminSupabase.from("activity_events").insert({
        user_id: userId,
        event_name: eventName,
        metadata: metadata || {},
      });
    } catch (e) {
      console.error("[AppLogger] Failed to track activity:", e);
    }
  },

  /**
   * Tracks a security event (e.g. Login, IP block)
   */
  trackSecurity: async (userId: string | null, eventType: SecurityEvent, ipAddress?: string, userAgent?: string, metadata?: any) => {
    try {
      await adminSupabase.from("security_logs").insert({
        user_id: userId,
        event_type: eventType,
        ip_address: ipAddress || 'unknown',
        user_agent: userAgent || 'unknown',
        metadata: metadata || {},
      });
    } catch (e) {
      console.error("[AppLogger] Failed to track security event:", e);
    }
  }
};
