import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { CreditsClient } from './CreditsClient';

export const metadata = {
  title: 'Lịch sử Credits - JobReady',
  description: 'Lịch sử biến động Credits của bạn',
};

export default async function CreditsPage({ searchParams }: { searchParams: any }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const params = await Promise.resolve(searchParams);

  const PAGE_SIZE = 15;
  const page = parseInt(params?.page || '1', 10) || 1;
  const offset = (page - 1) * PAGE_SIZE;

  const filterMessageCode = params?.message_code;
  const sortBy = params?.sortBy || 'created_at';
  const sortOrder = params?.sortOrder === 'asc' ? 'asc' : 'desc';

  // Query credit_transactions
  let txQuery = supabase
    .from('credit_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + PAGE_SIZE - 1);

  if (filterMessageCode) {
    txQuery = txQuery.eq('message_code' as any, filterMessageCode);
  }

  const { data: transactions, count } = await txQuery;

  return (
    <div className="space-y-8 pb-20">
      <CreditsClient
        transactions={transactions || []}
        txCount={count || 0}
        txPage={page}
      />
    </div>
  );
}
