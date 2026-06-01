'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FileText, UserCircle, FolderKanban, CreditCard, LogOut, FileCode2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { AppIcon } from '@/components/ui/AppIcon'

export function Sidebar({ user }: { user: { email?: string, full_name?: string, plan?: string } }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslation()

  const navigation = [
    { name: t('dashboard.nav.createCv'), href: '/dashboard', icon: FileCode2 },
    { name: t('dashboard.nav.masterProfile'), href: '/dashboard/profile', icon: UserCircle },
    { name: t('dashboard.nav.manageFiles'), href: '/dashboard/files', icon: FolderKanban },
    { name: t('dashboard.nav.billing'), href: '/dashboard/billing', icon: CreditCard },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-zinc-200">
      {/* Header / Logo */}
      <div className="flex h-16 items-center px-6 border-b border-zinc-200">
        <Link href="/" className="flex items-center gap-2 group">
          <AppIcon className="w-7 h-7 bg-primary rounded-sm [&>i]:text-[1rem]" />
          <span className="text-xl font-bold font-sans text-zinc-900 tracking-tight group-hover:text-zinc-600 transition-colors">
            CareerGo.
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm ${
                isActive
                  ? 'bg-zinc-100 text-zinc-900 font-bold'
                  : 'text-zinc-600 font-medium hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <item.icon
                strokeWidth={isActive ? 2 : 1.5}
                className={`h-4 w-4 ${
                  isActive ? 'text-zinc-900' : 'text-zinc-500'
                }`}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-zinc-200 p-4">
        <div className="mb-3 px-3 py-2 border border-zinc-200 rounded-sm bg-zinc-50">
          <p className="text-sm font-bold text-zinc-900 truncate">
            {user?.full_name || 'Người dùng'}
          </p>
          <p className="text-xs text-zinc-500 truncate mb-2">
            {user?.email}
          </p>
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase">
            <span className="text-zinc-500">{t('dashboard.user.currentPlan')}</span>
            <span className="text-zinc-900 px-1.5 py-0.5 border border-zinc-300 bg-white rounded-sm">
              {user?.plan || t('dashboard.user.free')}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors rounded-sm"
        >
          <LogOut strokeWidth={1.5} className="h-4 w-4" />
          {t('dashboard.user.logout')}
        </button>
      </div>
    </div>
  )
}
