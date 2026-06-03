"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { AppIcon } from "@/components/ui/AppIcon";
import { Mail, MapPin, Globe } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

          {/* Column 1: Brand & Info (Takes up 2 cols on lg) */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <AppIcon className="w-7 h-7 bg-primary rounded-sm [&>i]:text-[1rem]" />
              <span className="text-xl font-bold font-sans tracking-tight text-zinc-900">JobReady.</span>
            </Link>
            <p className="text-zinc-600 mb-8 leading-relaxed max-w-sm">
              {t('layout.footer.description')}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-zinc-600">
                <MapPin className="w-5 h-5 text-zinc-400" />
                <span>123 Đường Tôn Đức Thắng, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-600">
                <Mail className="w-5 h-5 text-zinc-400" />
                <span>support@jobready.vn</span>
              </div>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="font-bold text-zinc-900 mb-6 uppercase text-sm tracking-wider">{t('layout.footer.product')}</h3>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-zinc-600 hover:text-primary transition-colors">{t('layout.footer.features')}</Link></li>
              <li><Link href="#pricing" className="text-zinc-600 hover:text-primary transition-colors">{t('layout.footer.pricing')}</Link></li>
              <li><Link href="/templates" className="text-zinc-600 hover:text-primary transition-colors">{t('layout.footer.templates')}</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="font-bold text-zinc-900 mb-6 uppercase text-sm tracking-wider">{t('layout.footer.support')}</h3>
            <ul className="space-y-4">
              <li><Link href="#faq" className="text-zinc-600 hover:text-primary transition-colors">{t('layout.footer.faq')}</Link></li>
              <li><Link href="/contact" className="text-zinc-600 hover:text-primary transition-colors">{t('layout.footer.contact')}</Link></li>
              <li><Link href="/blog" className="text-zinc-600 hover:text-primary transition-colors">{t('layout.footer.blog')}</Link></li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h3 className="font-bold text-zinc-900 mb-6 uppercase text-sm tracking-wider">{t('layout.footer.connect')}</h3>
            <div className="flex gap-4 mb-8">
              <Link href="#" className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-primary hover:border-primary transition-all shadow-sm">
                <Globe className="w-5 h-5" />
              </Link>
            </div>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-zinc-600 hover:text-primary transition-colors text-sm">{t('layout.footer.privacy')}</Link></li>
              <li><Link href="/terms" className="text-zinc-600 hover:text-primary transition-colors text-sm">{t('layout.footer.terms')}</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            {t('layout.footer.copyright')}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-medium text-zinc-600">Hệ thống hoạt động bình thường</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
