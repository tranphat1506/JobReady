import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from '@/lib/getTranslations';
import { UsagesClient } from './UsagesClient';

export async function generateMetadata() {
  const { t } = await getTranslations();
  return {
    title: `${t('credits.history.title') || 'Lịch sử sử dụng AI'} - JobReady`,
  };
}

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

  // Query service usages logs from the secure view
  let logsQuery = supabase
    .from('user_service_usages_view')
    .select('id, action_type, status, error_message, created_at, credits_used', { count: 'exact' })
    .eq('user_id', user.id)
    .order(logSortBy, { ascending: logSortOrder === 'asc' })
    .range(logOffset, logOffset + PAGE_SIZE - 1);
  
  if (filterAction) logsQuery = logsQuery.eq('action_type', filterAction);
  if (filterStatus) logsQuery = logsQuery.eq('status', filterStatus);

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
