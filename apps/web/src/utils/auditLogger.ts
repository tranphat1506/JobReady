import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

interface AuditLogOptions {
  userId: string;
  action: string;
  previousState?: any;
  newState?: any;
}

/**
 * Logs an application-level activity directly into the `activity_logs` table.
 * Automatically captures the client's IP address from the request headers.
 */
export async function logUserActivity({
  userId,
  action,
  previousState = null,
  newState = null,
}: AuditLogOptions) {
  try {
    const headersList = await headers();
    
    // Create an admin client to bypass RLS for logging
    const adminSupabase = createSupabaseAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get IP address, fallback to empty string
    const forwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : headersList.get('x-real-ip') || '';

    // Route to appropriate table based on action type
    let tableName = 'activity_events';
    let payload: any = {
      user_id: userId,
      created_at: new Date().toISOString()
    };

    if (action.startsWith('SECURITY_') || action.startsWith('LOGIN_') || action.startsWith('AUTH_')) {
      tableName = 'security_logs';
      payload.event_type = action;
      payload.ip_address = ipAddress;
      payload.user_agent = headersList.get('user-agent') || '';
      payload.metadata = { previousState, newState };
    } else if (action.startsWith('DB_') || action.startsWith('APP_UPDATE') || action.startsWith('APP_DELETE')) {
      tableName = 'audit_logs';
      payload.entity_type = action.split('_')[1] || 'UNKNOWN';
      payload.action = action;
      payload.old_data = previousState;
      payload.new_data = newState;
    } else {
      tableName = 'activity_events';
      payload.event_name = action;
      payload.metadata = { previousState, newState, ipAddress };
    }

    const { error } = await adminSupabase.from(tableName).insert(payload);

    if (error) {
      console.error('[AuditLogger] Failed to insert activity log:', error);
    }
  } catch (err) {
    console.error('[AuditLogger] Unexpected error:', err);
  }
}

/**
 * A Higher-Order Function (Wrapper) for Next.js Server Actions.
 * It wraps a server action and automatically catches and logs any errors to `activity_logs`.
 */
export function withAuditLog<T extends (...args: any[]) => Promise<any>>(
  actionName: string,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error: any) {
      try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await logUserActivity({
            userId: user.id,
            action: `ERROR_${actionName.toUpperCase()}`,
            newState: { 
              error_message: error?.message || error?.toString() || 'Unknown error',
              args: args // Optionally log the arguments that caused the error
            }
          });
        }
      } catch (logErr) {
        console.error('[AuditLogger] Failed to log error state:', logErr);
      }
      
      // Re-throw the original error so the client still receives it
      throw error;
    }
  }) as T;
}
