'use server';

import { createClient } from '@/utils/supabase/server';
import { getCachedSystemSettings } from './settings';
import { revalidatePath } from 'next/cache';

export async function buySlot(type: 'cv' | 'cl') {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // Fetch prices from settings
  const settingsMap = await getCachedSystemSettings();
  const priceKey = type === 'cv' ? 'price_cv_slot' : 'price_cl_slot';
  
  // Default fallback prices if not set in DB
  const fallbackPrice = type === 'cv' ? 50 : 30;
  const cost = settingsMap[priceKey] ? Number(settingsMap[priceKey]) : fallbackPrice;

  // Call the database RPC to handle the transaction safely
  const { data, error } = await supabase.rpc('buy_slot', {
    p_user_id: user.id,
    p_slot_type: type,
    p_cost: cost
  });

  if (error) {
    console.error('Failed to buy slot:', error);
    // Standardize error message for user
    if (error.message.includes('Insufficient credits')) {
      throw new Error('Bạn không đủ Credit để mua thêm Slot này.');
    }
    throw new Error('Giao dịch thất bại. Vui lòng thử lại sau.');
  }

  // Revalidate the dashboard paths so the limits update immediately
  revalidatePath('/dashboard/billing');
  revalidatePath('/dashboard/usages');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/resumes');
  revalidatePath('/dashboard/cover-letters');

  return { success: true, cost };
}
