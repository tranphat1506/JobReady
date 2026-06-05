import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { AuditClient } from './AuditClient';

export const metadata = {
  title: 'Dev Audit Logs - JobReady',
};

export default async function DevAuditPage({ searchParams }: { searchParams: any }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const params = await Promise.resolve(searchParams);

  const PAGE_SIZE = 20;
  const page = parseInt(params?.page || '1', 10) || 1;
  const sortBy = params?.sortBy || 'created_at';
  const sortOrder = params?.sortOrder === 'asc' ? 'asc' : 'desc';
  const offset = (page - 1) * PAGE_SIZE;

  // We use the service role key to fetch ALL logs across the system, acting like a true Admin page.
  // This bypasses RLS on the activity_logs table.
  const adminSupabase = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let logsQuery = adminSupabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + PAGE_SIZE - 1);

  const { data: logs, count: logCount } = await logsQuery;

  return (
    <div className="space-y-8 pb-20">
      <AuditClient
        logs={logs || []}
        logCount={logCount || 0}
        logPage={page}
      />
    </div>
  );
}
