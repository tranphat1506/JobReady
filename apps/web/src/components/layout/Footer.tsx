"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { AppIcon } from "@/components/ui/AppIcon";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-zinc-50 py-12 border-t border-zinc-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight mb-4">
              <AppIcon />
              <span className="font-bold tracking-tight">CareerGo</span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              {t('layout.footer.description')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('layout.footer.product')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-zinc-900 transition-colors">{t('layout.footer.features')}</Link></li>
              <li><Link href="#pricing" className="hover:text-zinc-900 transition-colors">{t('layout.footer.pricing')}</Link></li>
              <li><Link href="/templates" className="hover:text-zinc-900 transition-colors">{t('layout.footer.templates')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('layout.footer.support')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-zinc-900 transition-colors">{t('layout.footer.faq')}</Link></li>
              <li><Link href="/contact" className="hover:text-zinc-900 transition-colors">{t('layout.footer.contact')}</Link></li>
              <li><Link href="/privacy" className="hover:text-zinc-900 transition-colors">{t('layout.footer.privacy')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} CareerGo. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link href="/terms" className="hover:text-foreground">{t('layout.footer.terms')}</Link>
            <Link href="/privacy" className="hover:text-foreground">{t('layout.footer.privacyPolicy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
