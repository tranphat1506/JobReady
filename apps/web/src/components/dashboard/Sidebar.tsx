'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FileText, UserCircle, FolderKanban, CreditCard, LogOut, FileCode2, Menu, X, PanelLeftClose, PanelLeftOpen, Wand2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { AppIcon } from '@/components/ui/AppIcon'
import { useSettingsStore } from '@/stores/useSettingsStore'

export function Sidebar({ user }: { user: { email?: string, full_name?: string, plan?: string, credits?: number, limits?: any } }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslation()
  const { language, setLanguage } = useSettingsStore()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigation = [
    { name: t('dashboard.nav.createCv') || 'Tạo CV', href: '/dashboard', icon: FileCode2 },
    { name: t('dashboard.nav.masterProfile') || 'Hồ Sơ Master', href: '/dashboard/profile', icon: UserCircle },
    { name: t('dashboard.nav.manageFiles') || 'Quản lý File', href: '/dashboard/files', icon: FolderKanban },
    { name: t('dashboard.nav.billing') || 'Lịch sử thanh toán', href: '/dashboard/billing', icon: CreditCard },
    { name: t('dashboard.nav.usages') || 'Lịch sử sử dụng AI', href: '/dashboard/usages', icon: Wand2 },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi')
  }

  return (
    <>
      {/* Mobile Header (Visible only on md-) */}
      <div className="flex md:hidden items-center justify-between h-14 px-4 bg-white border-b border-zinc-200 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <AppIcon className="w-6 h-6 bg-primary rounded-sm [&>i]:text-[0.875rem]" />
          <span className="text-lg font-bold font-sans text-zinc-900 tracking-tight">
            JobReady.
          </span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-600 p-2">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative z-50 md:z-auto top-14 md:top-0 h-[calc(100vh-3.5rem)] md:h-full w-full ${isCollapsed ? 'md:w-20' : 'md:w-64'} flex-col bg-white border-r border-zinc-200 transition-all duration-300`}>

        {/* Header / Logo (Hidden on mobile as it's in the mobile header) */}
        <div className={`hidden md:flex h-16 items-center border-b border-zinc-200 shrink-0 relative ${isCollapsed ? 'justify-center' : 'px-6 justify-between'}`}>
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2 group">
              <AppIcon className="w-7 h-7 bg-primary rounded-sm [&>i]:text-[1rem]" />
              <span className="text-xl font-bold font-sans text-zinc-900 tracking-tight group-hover:text-zinc-600 transition-colors">
                JobReady.
              </span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/" className="flex items-center group">
              <AppIcon className="w-7 h-7 bg-primary rounded-sm [&>i]:text-[1rem]" />
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`text-zinc-400 hover:text-zinc-900 transition-colors ${isCollapsed ? 'absolute -right-3 top-5 bg-white border border-zinc-200 rounded-full p-1 shadow-sm' : ''}`}
            title={isCollapsed ? t('dashboard.expand') || 'Mở rộng' : t('dashboard.collapse') || 'Thu gọn'}
          >
            {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 space-y-1 py-6 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 py-2.5 text-sm transition-colors rounded-lg ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-zinc-500 font-medium hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
              >
                <item.icon
                  strokeWidth={isActive ? 2 : 1.5}
                  className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-zinc-400'}`}
                />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions (User, Lang, Logout) */}
        <div className={`border-t border-zinc-200 bg-zinc-50/50 shrink-0 ${isCollapsed ? 'p-2 flex flex-col items-center gap-4' : 'p-4'}`}>

          {/* Language Switcher */}
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-4 px-3">
              <span className="text-xs font-medium text-zinc-500">
                {t('dashboard.user.language') || 'Language'}
              </span>
              <button
                onClick={toggleLanguage}
                className="flex items-center bg-zinc-100/50 border border-zinc-200 rounded-md p-0.5"
              >
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors ${language === 'vi' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>VI</span>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>EN</span>
              </button>
            </div>
          )}
          {isCollapsed && (
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center bg-white border border-zinc-200 rounded-sm w-8 h-8"
              title={t('dashboard.user.language') || 'Language'}
            >
              <span className="text-[10px] font-bold">{language.toUpperCase()}</span>
            </button>
          )}

          {/* Mini-dashboard: Credits & Limits */}
          {!isCollapsed && user?.limits && (
            <div className="mb-3 px-3 py-2 border border-primary/20 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="bg-primary/20 p-1 rounded-md">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-xs font-bold text-zinc-900">{user.credits || 0} Credits</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-600">
                <span>CV: {user.limits.cvUsed}/{user.limits.cvLimit}</span>
                <span>CL: {user.limits.clUsed}/{user.limits.clLimit}</span>
              </div>
            </div>
          )}

          {/* User Card */}
          {!isCollapsed && (
            <div className="mb-3 px-3 py-2 border border-zinc-200 rounded-lg bg-white shadow-sm">
              <p className="text-sm font-semibold text-zinc-900 truncate">
                {user?.full_name || 'Người dùng'}
              </p>
              <p className="text-xs text-zinc-500 truncate mb-2">
                {user?.email}
              </p>
              <div className="flex items-center justify-between text-[10px] font-semibold tracking-wide uppercase">
                <span className="text-zinc-500">{t('dashboard.user.currentPlan') || 'Plan'}</span>
                <span className="text-primary px-2 py-0.5 border border-primary/20 bg-primary/5 rounded-md">
                  {user?.plan || t('dashboard.user.free') || 'FREE'}
                </span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title={isCollapsed ? (t('dashboard.user.logout') || 'Đăng xuất') : undefined}
            className={`flex items-center text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-red-600 transition-colors rounded-lg ${isCollapsed ? 'justify-center p-2' : 'w-full gap-3 px-3 py-2.5'}`}
          >
            <LogOut strokeWidth={1.5} className="h-5 w-5" />
            {!isCollapsed && <span>{t('dashboard.user.logout') || 'Đăng xuất'}</span>}
          </button>
        </div>
      </div>
    </>
  )
}
