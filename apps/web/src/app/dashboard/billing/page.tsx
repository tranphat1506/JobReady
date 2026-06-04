import { CreditCard } from 'lucide-react'

export const metadata = {
  title: 'Lịch sử thanh toán - JobReady',
  description: 'Quản lý lịch sử nạp tiền và gói cước',
};

export default function BillingPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          Lịch sử thanh toán
        </h1>
        <p className="text-zinc-500 mt-1">Quản lý lịch sử nạp tiền và các gói cước của bạn</p>
      </div>
      <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-2">Tính năng đang phát triển</h2>
        <p className="text-zinc-500">Chức năng mua gói cước và thanh toán (Stripe/VNPay) sẽ sớm ra mắt trong các phiên bản tiếp theo.</p>
      </div>
    </div>
  )
}
