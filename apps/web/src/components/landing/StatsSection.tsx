"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function StatsSection() {
  const { t } = useTranslation();

  return (
    <section className="py-12 bg-zinc-50 border-y border-zinc-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-200">
          
          <div className="pt-4 md:pt-0">
            <h3 className="text-4xl font-extrabold text-primary mb-2 tracking-tight">
              {t('landing.stats.stat1Num')}
            </h3>
            <p className="text-zinc-600 font-medium">{t('landing.stats.stat1Label')}</p>
          </div>
          
          <div className="pt-8 md:pt-0">
            <h3 className="text-4xl font-extrabold text-primary mb-2 tracking-tight">
              {t('landing.stats.stat2Num')}
            </h3>
            <p className="text-zinc-600 font-medium">{t('landing.stats.stat2Label')}</p>
          </div>
          
          <div className="pt-8 md:pt-0">
            <h3 className="text-4xl font-extrabold text-primary mb-2 tracking-tight">
              {t('landing.stats.stat3Num')}
            </h3>
            <p className="text-zinc-600 font-medium">{t('landing.stats.stat3Label')}</p>
          </div>
          
        </div>
      </div>
    </section>
  );
}
