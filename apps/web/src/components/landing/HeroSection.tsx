"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Left Column: Text */}
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 mb-6 text-sm font-semibold tracking-wide">
              <span>{t('landing.hero.badge')}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-zinc-900 leading-[1.2]">
              {t('landing.hero.title')}
            </h1>
            
            <p className="text-lg text-zinc-600 mb-8 leading-relaxed max-w-lg">
              {t('landing.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 text-base font-semibold rounded-lg bg-primary hover:bg-emerald-600 text-white shadow-lg shadow-primary/25">
                  {t('landing.hero.ctaPrimary')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full h-14 px-8 text-base font-semibold rounded-lg text-zinc-700 border-zinc-300 hover:bg-zinc-50">
                  <PlayCircle className="w-5 h-5 mr-2 text-zinc-500" />
                  {t('landing.hero.ctaSecondary')}
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-zinc-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Không cần thẻ tín dụng
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Tải PDF miễn phí
              </div>
            </div>
          </div>

          {/* Right Column: Static Image / Mockup */}
          <div className="lg:w-1/2 w-full">
            <div className="relative w-full max-w-lg mx-auto bg-zinc-50 rounded-2xl border border-zinc-200 shadow-xl overflow-hidden p-6">
              {/* Simple Mockup representing a CV */}
              <div className="bg-white border border-zinc-100 rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-6 border-b border-zinc-100 pb-6">
                  <div className="w-16 h-16 bg-zinc-200 rounded-full flex-shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-zinc-300 rounded w-1/3"></div>
                    <div className="h-3 bg-zinc-200 rounded w-1/4"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="h-3 bg-zinc-300 rounded w-1/4 mb-3"></div>
                    <div className="h-2 bg-zinc-100 rounded w-full mb-2"></div>
                    <div className="h-2 bg-zinc-100 rounded w-5/6"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-zinc-300 rounded w-1/4 mb-3"></div>
                    <div className="h-2 bg-emerald-100 rounded w-full mb-2"></div>
                    <div className="h-2 bg-emerald-100 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
              
              {/* Highlight badge floating */}
              <div className="absolute top-10 -right-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-zinc-100 flex items-center gap-2 transform rotate-3">
                <span className="text-emerald-500 font-bold">100%</span>
                <span className="text-xs text-zinc-600 font-medium">Khớp JD</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
