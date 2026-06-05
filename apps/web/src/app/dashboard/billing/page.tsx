import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { BillingClient } from './BillingClient';

export const metadata = {
  title: 'Lịch sử thanh toán - JobReady',
  description: 'Quản lý lịch sử nạp tiền và gói cước',
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const PAGE_SIZE = 10;
  const payPage = parseInt(params?.payPage as string || '1', 10) || 1;
  const offset = (payPage - 1) * PAGE_SIZE;

  const payStatus = params?.payStatus as string;
  const paySortBy = params?.paySortBy as string || 'created_at';
  const paySortOrder = params?.paySortOrder === 'asc' ? 'asc' : 'desc';

  let subQuery = supabase
    .from('subscriptions')
    .select('*, packages(name, price)', { count: 'exact' })
    .eq('user_id', user.id)
    .order(paySortBy, { ascending: paySortOrder === 'asc' })
    .range(offset, offset + PAGE_SIZE - 1);

  if (payStatus) {
    subQuery = subQuery.eq('status', payStatus);
  }

  const { data: rawSubscriptions, count: payCount } = await subQuery;

  // Map data to match BillingClient's expectations
  const subscriptions = (rawSubscriptions || []).map((sub: any) => ({
    ...sub,
    start_date: sub.start_date || sub.current_period_start || sub.created_at,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <BillingClient 
        subscriptions={subscriptions}
        payCount={payCount || 0}
        payPage={payPage}
      />
    </div>
  );
}
