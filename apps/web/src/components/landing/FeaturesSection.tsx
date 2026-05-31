"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { CheckCircle, FileText, LayoutTemplate } from "lucide-react";

export default function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">
            {t('landing.features.title')}
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed">
            {t('landing.features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-4">
              {t('landing.features.f1Title')}
            </h3>
            <p className="text-zinc-600 leading-relaxed">
              {t('landing.features.f1Desc')}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-4">
              {t('landing.features.f2Title')}
            </h3>
            <p className="text-zinc-600 leading-relaxed">
              {t('landing.features.f2Desc')}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <LayoutTemplate className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-4">
              {t('landing.features.f3Title')}
            </h3>
            <p className="text-zinc-600 leading-relaxed">
              {t('landing.features.f3Desc')}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
