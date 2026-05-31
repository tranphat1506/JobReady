"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
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
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <AppIcon />
          <span className="font-bold tracking-tight">CareerGo</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">{t('layout.header.features')}</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">{t('layout.header.pricing')}</Link>
          <Link href="#faq" className="hover:text-foreground transition-colors">{t('layout.header.faq')}</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-xs font-bold uppercase gap-1.5 px-3">
            <Globe className="w-4 h-4" />
            <span>{language.toUpperCase()}</span>
          </Button>

          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors hidden sm:block">
            {t('layout.header.login')}
          </Link>
          <Link href="/dashboard">
            <Button className="px-5 font-semibold rounded-md text-sm h-9">{t('layout.header.getStarted')}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
