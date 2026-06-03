'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FileText, UserCircle, FolderKanban, CreditCard, LogOut, FileCode2, Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { AppIcon } from '@/components/ui/AppIcon'
import { useSettingsStore } from '@/stores/useSettingsStore'

export function Sidebar({ user }: { user: { email?: string, full_name?: string, plan?: string } }) {
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
    { name: t('dashboard.nav.billing') || 'Gói cước', href: '/dashboard/billing', icon: CreditCard },
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
            CareerGo.
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
                CareerGo.
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
                className={`flex items-center gap-3 py-2.5 text-sm transition-colors rounded-sm ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 font-bold'
                    : 'text-zinc-600 font-medium hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <item.icon
                  strokeWidth={isActive ? 2 : 1.5}
                  className={`h-5 w-5 ${
                    isActive ? 'text-zinc-900' : 'text-zinc-500'
                  }`}
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {t('dashboard.user.language') || 'Language'}
              </span>
              <button
                onClick={toggleLanguage}
                className="flex items-center bg-white border border-zinc-200 rounded-sm p-0.5"
              >
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition-colors ${language === 'vi' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}>VI</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition-colors ${language === 'en' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}>EN</span>
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

          {/* User Card */}
          {!isCollapsed && (
            <div className="mb-3 px-3 py-2 border border-zinc-200 rounded-sm bg-white">
              <p className="text-sm font-bold text-zinc-900 truncate">
                {user?.full_name || 'Người dùng'}
              </p>
              <p className="text-xs text-zinc-500 truncate mb-2">
                {user?.email}
              </p>
              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase">
                <span className="text-zinc-500">{t('dashboard.user.currentPlan') || 'Plan'}</span>
                <span className="text-zinc-900 px-1.5 py-0.5 border border-zinc-300 bg-zinc-50 rounded-sm">
                  {user?.plan || t('dashboard.user.free') || 'FREE'}
                </span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title={isCollapsed ? (t('dashboard.user.logout') || 'Đăng xuất') : undefined}
            className={`flex items-center text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors rounded-sm ${isCollapsed ? 'justify-center p-2' : 'w-full gap-3 px-3 py-2'}`}
          >
            <LogOut strokeWidth={1.5} className="h-5 w-5" />
            {!isCollapsed && <span>{t('dashboard.user.logout') || 'Đăng xuất'}</span>}
          </button>
        </div>
      </div>
    </>
  )
}
