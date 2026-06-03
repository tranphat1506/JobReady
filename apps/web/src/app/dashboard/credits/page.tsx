import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Clock, CreditCard, Activity, CheckCircle2, XCircle } from 'lucide-react';

export const metadata = {
  title: 'Credits & History - JobReady',
  description: 'Manage your credits and view generation history',
};

export default async function CreditsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user logs
  const { data: logs, error } = await supabase
    .from('ai_generation_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Calculate statistics
  const totalGenerations = logs?.length || 0;
  // For now, assume 1 action = 1 credit used. 
  // In the future, this can be linked to the subscriptions and packages table.
  const creditsUsed = totalGenerations; 
  
  const successfulGenerations = logs?.filter(log => log.status === 'success').length || 0;

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'generate_cv': return 'Tạo CV (AI)';
      case 'generate_cover_letter': return 'Tạo Cover Letter (AI)';
      case 'generate_both': return 'Tạo CV & Cover Letter (AI)';
      case 'parse_master_profile': return 'Trích xuất Master Profile (AI)';
      default: return action;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Credits & Lịch sử</h1>
        <p className="text-zinc-500 mt-2">Thống kê việc sử dụng trí tuệ nhân tạo (AI) và lịch sử tiêu thụ Credit của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Credits Đã Sử Dụng</p>
              <h3 className="text-3xl font-bold text-zinc-900">{creditsUsed}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Lượt Tạo Sinh (Generations)</p>
              <h3 className="text-3xl font-bold text-zinc-900">{totalGenerations}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Thành công</p>
              <h3 className="text-3xl font-bold text-zinc-900">{successfulGenerations}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center gap-2">
          <Clock className="w-5 h-5 text-zinc-400" />
          <h2 className="text-lg font-semibold text-zinc-900">Lịch sử giao dịch AI</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-4 font-semibold">Thời gian</th>
                <th className="px-6 py-4 font-semibold">Hành động</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Credit sử dụng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {(!logs || logs.length === 0) ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    Bạn chưa thực hiện tạo sinh AI nào.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {new Date(log.created_at).toLocaleString('vi-VN', { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-zinc-900">{getActionLabel(log.action_type)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Thành công
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700" title={log.error_message || 'Lỗi không xác định'}>
                          <XCircle className="w-3.5 h-3.5" /> Thất bại
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-zinc-900">
                      -1 Credit
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
