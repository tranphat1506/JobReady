"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, Menu } from "lucide-react";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useTranslation } from "@/hooks/useTranslation";
import { AppIcon } from "@/components/ui/AppIcon";

export default function Header() {
  const { language, setLanguage } = useSettingsStore();
  const { t } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white border-b border-zinc-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <AppIcon />
          <span className="text-2xl font-bold tracking-tight text-zinc-900">CareerGo</span>
        </Link>
        
        {/* Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-zinc-600">
          <Link href="#features" className="hover:text-primary transition-colors">{t('layout.header.features')}</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">{t('layout.header.pricing')}</Link>
          <Link href="/templates" className="hover:text-primary transition-colors">{t('layout.header.templates')}</Link>
          <Link href="/blog" className="hover:text-primary transition-colors">{t('layout.header.blog')}</Link>
          <Link href="#faq" className="hover:text-primary transition-colors">{t('layout.header.faq')}</Link>
        </nav>
        
        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-xs font-bold uppercase gap-1.5 px-3 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
            <Globe className="w-4 h-4" />
            <span>{language.toUpperCase()}</span>
          </Button>

          <Link href="/login" className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            {t('layout.header.login')}
          </Link>
          
          <Link href="/dashboard">
            <Button className="px-6 font-semibold rounded-md text-[15px] h-10 bg-primary hover:bg-emerald-600 text-white shadow-md shadow-primary/20">
              {t('layout.header.getStarted')}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleLanguage}>
            <Globe className="w-5 h-5 text-zinc-600" />
          </Button>
          <Button variant="ghost" size="icon">
            <Menu className="w-6 h-6 text-zinc-900" />
          </Button>
        </div>
      </div>
    </header>
  );
}
