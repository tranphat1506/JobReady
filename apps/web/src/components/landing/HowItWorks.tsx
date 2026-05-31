"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { UserPlus, Search, DownloadCloud } from "lucide-react";

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      title: t('landing.howItWorks.s1Title'),
      desc: t('landing.howItWorks.s1Desc'),
      icon: UserPlus,
    },
    {
      title: t('landing.howItWorks.s2Title'),
      desc: t('landing.howItWorks.s2Desc'),
      icon: Search,
    },
    {
      title: t('landing.howItWorks.s3Title'),
      desc: t('landing.howItWorks.s3Desc'),
      icon: DownloadCloud,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-zinc-50 border-t border-zinc-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">
            {t('landing.howItWorks.title')}
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed">
            {t('landing.howItWorks.subtitle')}
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-zinc-200 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center">
                  
                  {/* Icon Circle */}
                  <div className="w-24 h-24 bg-white border-4 border-zinc-50 rounded-full flex items-center justify-center shadow-lg shadow-zinc-200/50 mb-6 relative">
                    <Icon className="w-10 h-10 text-primary" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm">
                      {index + 1}
                    </div>
                  </div>

                  {/* Text Content */}
                  <h3 className="text-xl font-bold text-zinc-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-zinc-600 leading-relaxed max-w-sm">
                    {step.desc}
                  </p>
                  
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
