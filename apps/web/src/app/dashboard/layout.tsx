import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Lấy thêm thông tin package/credits từ bảng public.users nếu cần thiết
  const { data: dbUser } = await supabase
    .from('users')
    .select('full_name, email, preferences')
    .eq('id', user.id)
    .single()

  const userData = {
    email: user.email,
    full_name: dbUser?.full_name || user.user_metadata?.full_name || 'Người dùng',
    plan: 'FREE', // Có thể query từ bảng subscriptions sau
  }

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      <Sidebar user={userData} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
