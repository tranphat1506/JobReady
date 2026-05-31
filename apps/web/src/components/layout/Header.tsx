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
          <span>CV<span className="text-primary">Gen</span></span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">{t('layout.header.features')}</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">{t('layout.header.pricing')}</Link>
          <Link href="#faq" className="hover:text-foreground transition-colors">{t('layout.header.faq')}</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-full" title="Toggle Language">
            <Globe className="w-5 h-5" />
            <span className="sr-only">Toggle Language</span>
            <span className="ml-2 text-xs font-bold uppercase">{language}</span>
          </Button>

          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
            {t('layout.header.login')}
          </Link>
          <Link href="/dashboard">
            <Button className="rounded-full px-6 font-bold">{t('layout.header.getStarted')}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
