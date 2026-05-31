"use client";

import { motion } from "framer-motion";
import { BrainCircuit, FileSignature, Target, Zap } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-cyan-400" />,
      title: t('landing.features.f1Title'),
      description: t('landing.features.f1Desc')
    },
    {
      icon: <FileSignature className="w-8 h-8 text-purple-400" />,
      title: t('landing.features.f2Title'),
      description: t('landing.features.f2Desc')
    },
    {
      icon: <Target className="w-8 h-8 text-emerald-400" />,
      title: t('landing.features.f3Title'),
      description: t('landing.features.f3Desc')
    },
    {
      icon: <Zap className="w-8 h-8 text-amber-400" />,
      title: t('landing.features.f4Title'),
      description: t('landing.features.f4Desc')
    }
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
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
              className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-6 p-4 bg-muted rounded-xl inline-block">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
