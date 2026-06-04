import { createClient } from '@/utils/supabase/server'
import { CreditCard, ArrowDownRight, ArrowUpRight, History } from 'lucide-react'

export const metadata = {
  title: 'Lịch sử thanh toán - JobReady',
  description: 'Quản lý lịch sử giao dịch và tín dụng',
};

export default async function BillingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch transactions
  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'parse_master_profile': return 'Tạo Master Profile (AI)'
      case 'generate_cv': return 'Tạo CV (AI)'
      case 'generate_cover_letter': return 'Tạo Cover Letter (AI)'
      case 'PURCHASE': return 'Nạp Credits'
      case 'BONUS': return 'Tặng thưởng'
      case 'REFUND': return 'Hoàn tiền'
      case 'PENDING_RESERVATION': return 'Đang xử lý (Pending)'
      default: return type
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          Lịch sử thanh toán
        </h1>
        <p className="text-zinc-500 mt-1">Quản lý các giao dịch sử dụng tín dụng (Credits) của bạn</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center gap-2">
          <History className="w-5 h-5 text-zinc-500" />
          <h2 className="font-semibold text-zinc-700">50 giao dịch gần nhất</h2>
        </div>
        
        {transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Thời gian</th>
                  <th className="px-6 py-4 font-semibold">Loại giao dịch</th>
                  <th className="px-6 py-4 font-semibold text-right">Số lượng</th>
                  <th className="px-6 py-4 font-semibold text-right">Số dư</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                      {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(tx.created_at!))}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-700">
                      {formatTransactionType(tx.transaction_type)}
                      {tx.transaction_type === 'PENDING_RESERVATION' && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                          Đang chờ
                        </span>
                      )}
                      {tx.transaction_type === 'REFUND' && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                          Hoàn tiền
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      <div className={`flex items-center justify-end gap-1 ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.amount > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-zinc-900">
                      {tx.balance_after}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 mb-4">
              <History className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">Chưa có giao dịch nào</h3>
            <p className="text-sm text-zinc-500 mt-1">Bạn chưa thực hiện bất kỳ giao dịch sử dụng AI nào.</p>
          </div>
        )}
      </div>
    </div>
  )
}
