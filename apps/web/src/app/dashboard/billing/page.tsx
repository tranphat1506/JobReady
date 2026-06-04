import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from '@/lib/getTranslations';
import { BillingClient } from './BillingClient';

export async function generateMetadata() {
  const { t } = await getTranslations();
  return {
    title: `${t('credits.billing.title') || 'Lịch sử thanh toán'} - JobReady`,
  };
}

export default async function BillingPage({ searchParams }: { searchParams: any }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const params = await Promise.resolve(searchParams);
  
  const PAGE_SIZE = 10;
  const payPage = parseInt(params?.payPage || '1', 10) || 1;
  const filterPayStatus = params?.payStatus;
  const paySortBy = params?.paySortBy || 'start_date';
  const paySortOrder = params?.paySortOrder === 'asc' ? 'asc' : 'desc';
  const payOffset = (payPage - 1) * PAGE_SIZE;

  // Query Payment history
  let payQuery = supabase
    .from('subscriptions')
    .select('id, status, start_date, end_date, package_id, packages(name, price, credits_per_month)', { count: 'exact' })
    .eq('user_id', user.id)
    .order(paySortBy, { ascending: paySortOrder === 'asc' })
    .range(payOffset, payOffset + PAGE_SIZE - 1);
  
  if (filterPayStatus) payQuery = payQuery.eq('status', filterPayStatus);

  const { data: subscriptions, count: payCount } = await payQuery;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <BillingClient 
        subscriptions={subscriptions || []}
        payCount={payCount || 0}
        payPage={payPage}
      />
    </div>
  );
}
