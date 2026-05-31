"use client";

import { motion } from "framer-motion";
import { Upload, Sparkles, Download } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    { icon: <Upload className="w-5 h-5 text-cyan-500" />, step: '01', title: t('landing.howItWorks.s1Title'), description: t('landing.howItWorks.s1Desc') },
    { icon: <Sparkles className="w-5 h-5 text-violet-500" />, step: '02', title: t('landing.howItWorks.s2Title'), description: t('landing.howItWorks.s2Desc') },
    { icon: <Download className="w-5 h-5 text-emerald-500" />, step: '03', title: t('landing.howItWorks.s3Title'), description: t('landing.howItWorks.s3Desc') }
  ];

  return (
    <section className="py-24 bg-white border-t border-zinc-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.howItWorks.title')}</h2>
          <p className="text-muted-foreground text-lg">
            {t('landing.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full border-2 border-zinc-900 flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <div className="text-xs font-bold text-zinc-400 mb-2 tracking-widest">{step.step}</div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
