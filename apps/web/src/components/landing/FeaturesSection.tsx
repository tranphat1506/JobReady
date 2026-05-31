"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { SearchCheck, FileCheck2, PenTool, Globe2 } from "lucide-react";

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: SearchCheck,
      title: t('landing.features.f1Title'),
      desc: t('landing.features.f1Desc'),
    },
    {
      icon: FileCheck2,
      title: t('landing.features.f2Title'),
      desc: t('landing.features.f2Desc'),
    },
    {
      icon: PenTool,
      title: t('landing.features.f3Title'),
      desc: t('landing.features.f3Desc'),
    },
    {
      icon: Globe2,
      title: t('landing.features.f4Title'),
      desc: t('landing.features.f4Desc'),
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6 tracking-tight">
            {t('landing.features.title')}
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed">
            {t('landing.features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex flex-col sm:flex-row gap-6 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center flex-shrink-0 border border-zinc-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-zinc-600 leading-relaxed text-base">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
