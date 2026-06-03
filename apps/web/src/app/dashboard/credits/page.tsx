import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from '@/lib/getTranslations';
import { Clock, CreditCard, CheckCircle2, XCircle, BarChart3, Receipt } from 'lucide-react';

export async function generateMetadata() {
  const { t } = await getTranslations();
  return {
    title: `${t('credits.title')} - JobReady`,
  };
}

export default async function CreditsPage() {
  const supabase = await createClient();
  const { t } = await getTranslations();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // AI usage logs (no token data exposed)
  const { data: logs } = await supabase
    .from('ai_generation_logs')
    .select('id, action_type, status, error_message, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Payment history from subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id, status, start_date, end_date, package_id, packages(name, price, cv_slot_limit, cl_slot_limit)')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false });

  // Get user credits
  const { data: userData } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single();

  const credits = userData?.credits ?? 0;

  const total = logs?.length ?? 0;
  const success = logs?.filter(l => l.status === 'success').length ?? 0;

  const getActionLabel = (action: string) => {
    const key = `credits.history.action.${action}`;
    const label = t(key);
    return label === key ? action : label;
  };

  const activeSub = subscriptions?.find(s => s.status === 'ACTIVE');
  const packages = activeSub?.packages as any;
  const currentPlanName = packages?.name ?? 'FREE';
  const cvLimit = packages?.cv_slot_limit ?? 2;
  const clLimit = packages?.cl_slot_limit ?? 2;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{t('credits.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t('credits.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <p className="text-xs text-zinc-500 mb-1 font-medium uppercase tracking-wide">Số dư Credits</p>
          <p className="text-4xl font-bold text-zinc-900">{credits}</p>
          <p className="text-xs text-zinc-400 mt-1">Sử dụng cho tạo CV và tính năng AI</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <p className="text-xs text-zinc-500 mb-1 font-medium uppercase tracking-wide">Giới hạn Lưu trữ</p>
          <div className="flex items-center gap-4 mt-2">
            <div>
              <p className="text-xl font-bold text-zinc-900">{cvLimit}</p>
              <p className="text-xs text-zinc-400">CV Slots</p>
            </div>
            <div className="w-px h-8 bg-zinc-200"></div>
            <div>
              <p className="text-xl font-bold text-zinc-900">{clLimit}</p>
              <p className="text-xs text-zinc-400">Cover Letter Slots</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <p className="text-xs text-zinc-500 mb-1 font-medium uppercase tracking-wide">{t('credits.stats.currentPlan')}</p>
          <p className="text-2xl font-bold text-primary mt-1 uppercase">{currentPlanName}</p>
          <p className="text-xs text-zinc-400 mt-1">{t('credits.stats.upgradeCta')}</p>
        </div>
      </div>

      {/* AI Usage History */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-800">{t('credits.history.title')}</span>
        </div>

        {(!logs || logs.length === 0) ? (
          <div className="py-14 text-center">
            <BarChart3 className="w-7 h-7 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">{t('credits.history.empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.status === 'success' ? 'bg-green-500' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{getActionLabel(log.action_type)}</p>
                    <p className="text-xs text-zinc-400">
                      {new Date(log.created_at).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {log.status === 'success' ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('credits.history.status.success')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-500 font-medium" title={log.error_message ?? ''}>
                      <XCircle className="w-3.5 h-3.5" /> {t('credits.history.status.failed')}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                    {t('credits.history.creditUsed')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-800">{t('credits.billing.title')}</span>
        </div>

        {(!subscriptions || subscriptions.length === 0) ? (
          <div className="py-14 text-center">
            <CreditCard className="w-7 h-7 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">{t('credits.billing.empty')}</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-xs text-zinc-500 uppercase tracking-wide">
                <th className="px-5 py-3 font-semibold">{t('credits.billing.columns.date')}</th>
                <th className="px-5 py-3 font-semibold">{t('credits.billing.columns.package')}</th>
                <th className="px-5 py-3 font-semibold text-right">{t('credits.billing.columns.amount')}</th>
                <th className="px-5 py-3 font-semibold text-right">{t('credits.billing.columns.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {subscriptions.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3.5 text-zinc-600">
                    {new Date(sub.start_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-zinc-800">{sub.packages?.name ?? '-'}</td>
                  <td className="px-5 py-3.5 text-right text-zinc-700">
                    {sub.packages?.price != null
                      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sub.packages.price)
                      : '-'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
