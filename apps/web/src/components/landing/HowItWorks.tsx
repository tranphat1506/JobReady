"use client";

import { motion } from "framer-motion";
import { Upload, Sparkles, Download } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: <Upload className="w-6 h-6 text-cyan-400" />,
      title: t('landing.howItWorks.s1Title'),
      description: t('landing.howItWorks.s1Desc')
    },
    {
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      title: t('landing.howItWorks.s2Title'),
      description: t('landing.howItWorks.s2Desc')
    },
    {
      icon: <Download className="w-6 h-6 text-emerald-400" />,
      title: t('landing.howItWorks.s3Title'),
      description: t('landing.howItWorks.s3Desc')
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.howItWorks.title')}</h2>
          <p className="text-muted-foreground text-lg">
            {t('landing.howItWorks.subtitle')}
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center text-center bg-background px-6 py-8 rounded-2xl border border-border md:border-none shadow-sm md:shadow-none"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6 shadow-sm border border-border">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
