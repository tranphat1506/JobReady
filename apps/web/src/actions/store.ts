'use server';

import { createClient } from '@/utils/supabase/server';
import { ErrorCodes } from '@/lib/constants/errors';
import { SLOT_PRICING } from '@/constants/pricing';
import { revalidatePath } from 'next/cache';
import { withAuditLog } from '@/utils/auditLogger';

export const buySlot = withAuditLog('BUY_SLOT', async (type: 'cv' | 'cl') => {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(ErrorCodes.UNAUTHORIZED);
  }

  const cost = type === 'cv' ? SLOT_PRICING.cv : SLOT_PRICING.cl;

  // Call the database RPC to handle the transaction safely
  const { error } = await supabase.rpc('buy_slot', {
    p_user_id: user.id,
    p_slot_type: type,
    p_cost: cost
  });

  if (error) {
    console.error('Failed to buy slot:', error);
    if (error.message.includes('Insufficient credits')) {
      throw new Error(ErrorCodes.INSUFFICIENT_CREDITS);
    }
    throw new Error(ErrorCodes.TRANSACTION_FAILED);
  }

  // Revalidate the dashboard paths so the limits update immediately
  revalidatePath('/dashboard/billing');
  revalidatePath('/dashboard/usages');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/resumes');
  revalidatePath('/dashboard/cover-letters');
  revalidatePath('/dashboard/files');

  return { success: true, cost };
});
