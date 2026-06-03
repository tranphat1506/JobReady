'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'

export function HarvardHeader({ user }: { user: { email?: string, full_name?: string, plan?: string } }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { name: t('dashboard.nav.createCv'), href: '/dashboard' },
    { name: t('dashboard.nav.masterProfile'), href: '/dashboard/profile' },
    { name: t('dashboard.nav.manageFiles'), href: '/dashboard/files' },
    { name: t('dashboard.nav.billing'), href: '/dashboard/billing' },
  ]

  return (
    <div className="w-full mb-10">
      {/* 1. Tiêu đề lớn (Name/Brand) */}
      <div className="text-center mb-2">
        <Link href="/" className="text-4xl font-bold font-sans tracking-widest uppercase text-black">
          JobReady.
        </Link>
      </div>

      {/* 2. Thông tin liên hệ (User Info) */}
      <div className="text-center text-sm font-sans text-black mb-4 flex items-center justify-center gap-2">
        <span className="font-bold">{user.full_name || 'Người dùng'}</span>
        <span>•</span>
        <span>{user.email}</span>
        <span>•</span>
        <span>Gói: {user.plan || t('dashboard.user.free')}</span>
        <span>•</span>
        <button onClick={handleLogout} className="hover:underline uppercase text-xs font-bold tracking-widest">
          [{t('dashboard.user.logout')}]
        </button>
      </div>

      <hr className="border-t-2 border-black w-full mb-1" />

      {/* 3. Navigation / Danh mục */}
      <nav className="flex justify-center items-center gap-8 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm tracking-widest uppercase font-sans ${isActive ? 'font-bold text-black border-b border-black pb-1' : 'text-black hover:underline'
                }`}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

      <hr className="border-t-2 border-black w-full mt-1" />
    </div>
  )
}
