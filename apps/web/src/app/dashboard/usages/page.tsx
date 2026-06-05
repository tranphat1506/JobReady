import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from '@/lib/getTranslations';
import { History } from 'lucide-react';
import { UsagesClient } from './UsagesClient';

export const metadata = {
  title: 'Lịch sử sử dụng AI - JobReady',
  description: 'Quản lý lịch sử tiêu thụ tín dụng AI',
};

export default async function UsagesPage({ searchParams }: { searchParams: any }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const params = await Promise.resolve(searchParams);

  const PAGE_SIZE = 10;
  const logPage = parseInt(params?.logPage || '1', 10) || 1;
  const filterAction = params?.action;
  const filterStatus = params?.status;
  const logSortBy = params?.logSortBy || 'created_at';
  const logSortOrder = params?.logSortOrder === 'asc' ? 'asc' : 'desc';
  const logOffset = (logPage - 1) * PAGE_SIZE;

  // Query service usages logs from credit_transactions (Ledger)
  let logsQuery = supabase
    .from('credit_transactions')
    .select('id, transaction_type, amount, balance_after, created_at, reference_id, metadata', { count: 'exact' })
    .eq('user_id', user.id)
    .not('transaction_type', 'in', '("PURCHASE", "BONUS")')
    .order(logSortBy, { ascending: logSortOrder === 'asc' })
    .range(logOffset, logOffset + PAGE_SIZE - 1);

  if (filterAction) logsQuery = logsQuery.eq('transaction_type', filterAction);
  // Status filter doesn't apply to ledger as directly, so we'll just ignore it for now or we could filter by REFUND

  const { data: logs, count: logCount } = await logsQuery;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">

      <UsagesClient
        logs={logs || []}
        logCount={logCount || 0}
        logPage={logPage}
      />
    </div>
  );
}
