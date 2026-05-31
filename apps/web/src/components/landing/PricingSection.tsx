"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PricingSection() {
  const { t } = useTranslation();

  return (
    <section id="pricing" className="py-24 bg-zinc-50 border-t border-zinc-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6 tracking-tight">
            {t('landing.pricing.title')}
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed">
            {t('landing.pricing.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">{t('landing.pricing.free.name')}</h3>
            <p className="text-zinc-500 mb-6 h-12">{t('landing.pricing.free.desc')}</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-zinc-900">{t('landing.pricing.free.price')}</span>
              <span className="text-zinc-500 font-medium">{t('landing.pricing.free.period')}</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-600">{t('landing.pricing.free.f1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-600">{t('landing.pricing.free.f2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-600">{t('landing.pricing.free.f3')}</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-600">{t('landing.pricing.free.f4')}</span>
              </li>
            </ul>

            <Link href="/dashboard" className="mt-auto">
              <Button variant="outline" className="cursor-pointer w-full h-12 text-base font-semibold border-zinc-300 text-zinc-700 hover:bg-zinc-50">
                {t('landing.pricing.free.button')}
              </Button>
            </Link>
          </div>

          {/* Basic Plan */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">{t('landing.pricing.basic.name')}</h3>
            <p className="text-zinc-500 mb-6 h-12">{t('landing.pricing.basic.desc')}</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-zinc-900">{t('landing.pricing.basic.price')}</span>
              <span className="text-zinc-500 font-medium">{t('landing.pricing.basic.period')}</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-600">{t('landing.pricing.basic.f1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-600">{t('landing.pricing.basic.f2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-600">{t('landing.pricing.basic.f3')}</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-600">{t('landing.pricing.basic.f4')}</span>
              </li>
            </ul>

            <Link href="/dashboard" className="mt-auto">
              <Button variant="outline" className="cursor-pointer w-full h-12 text-base font-semibold border-zinc-300 text-zinc-700 hover:bg-zinc-50">
                {t('landing.pricing.basic.button')}
              </Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-bl-xl">
              Phổ biến nhất
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">{t('landing.pricing.pro.name')}</h3>
            <p className="text-zinc-400 mb-6 h-12">{t('landing.pricing.pro.desc')}</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-white">{t('landing.pricing.pro.price')}</span>
              <span className="text-zinc-400 font-medium">{t('landing.pricing.pro.period')}</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-300">{t('landing.pricing.pro.f1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-300">{t('landing.pricing.pro.f2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-300">{t('landing.pricing.pro.f3')}</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-300">{t('landing.pricing.pro.f4')}</span>
              </li>
            </ul>

            <Link href="/dashboard" className="mt-auto">
              <Button className="cursor-pointer w-full h-12 text-base font-bold bg-primary hover:bg-emerald-700 text-white hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200">
                {t('landing.pricing.pro.button')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
