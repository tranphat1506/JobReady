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

  const { data: dbUser } = await supabase
    .from('users')
    .select('full_name, email, preferences')
    .eq('id', user.id)
    .single()

  const userData = {
    email: user.email,
    full_name: dbUser?.full_name || user.user_metadata?.full_name || 'Người dùng',
    plan: 'FREE',
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-50 overflow-hidden font-sans">
      <Sidebar user={userData} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
