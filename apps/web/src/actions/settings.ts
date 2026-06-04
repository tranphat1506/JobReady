import { unstable_cache } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Fetches system settings from the database.
 * The results are cached for 1 hour to reduce database queries.
 * Note: If settings change, the cache will be stale for up to 1 hour unless revalidated via tags.
 */
export const getCachedSystemSettings = unstable_cache(
  async () => {
    // Use a cookie-less client for cache to avoid Next.js dynamic errors
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
    
    const { data: settingsData, error } = await supabase.from('system_settings').select('key, value');
    
    if (error || !settingsData) {
      console.error('Failed to fetch system_settings for cache:', error);
      return {};
    }

    const settingsMap: Record<string, string> = {};
    settingsData.forEach(item => {
      settingsMap[item.key] = item.value;
    });
    
    return settingsMap;
  },
  ['system_settings'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['system_settings']
  }
);
