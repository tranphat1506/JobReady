"use client";

import { motion } from "framer-motion";
import { BrainCircuit, FileSignature, Target, Zap } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    { icon: <BrainCircuit className="w-6 h-6" />, title: t('landing.features.f1Title'), description: t('landing.features.f1Desc') },
    { icon: <FileSignature className="w-6 h-6" />, title: t('landing.features.f2Title'), description: t('landing.features.f2Desc') },
    { icon: <Target className="w-6 h-6" />, title: t('landing.features.f3Title'), description: t('landing.features.f3Desc') },
    { icon: <Zap className="w-6 h-6" />, title: t('landing.features.f4Title'), description: t('landing.features.f4Desc') }
  ];

  return (
    <section id="features" className="py-24 bg-zinc-50 border-t border-zinc-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.features.title')}</h2>
          <p className="text-muted-foreground text-lg">
            {t('landing.features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors"
            >
              <div className="mb-5 w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
