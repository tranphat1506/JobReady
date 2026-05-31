"use client";

import { motion } from "framer-motion";
import { Radar, ShieldCheck, Mail, LockKeyhole } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-24 bg-zinc-50 border-b border-zinc-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Heading */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            {t('landing.features.title')}
          </h2>
          <p className="text-zinc-500 text-lg">
            {t('landing.features.subtitle')}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
          
          {/* Box 1: Large Span 2 Cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 bg-white rounded-2xl p-8 border border-zinc-200 flex flex-col justify-between overflow-hidden relative group"
          >
            <div className="relative z-10 max-w-md">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Radar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-3">{t('landing.features.f1Title')}</h3>
              <p className="text-zinc-500 leading-relaxed">
                {t('landing.features.f1Desc')}
              </p>
            </div>
            {/* Visual Decoration */}
            <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <Radar className="w-64 h-64 text-zinc-900" />
            </div>
          </motion.div>

          {/* Box 2: Single Col */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-8 border border-zinc-200 flex flex-col overflow-hidden relative group"
          >
            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
              <ShieldCheck className="w-6 h-6 text-zinc-900 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3">{t('landing.features.f2Title')}</h3>
            <p className="text-zinc-500 leading-relaxed text-sm">
              {t('landing.features.f2Desc')}
            </p>
          </motion.div>

          {/* Box 3: Single Col */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 border border-zinc-200 flex flex-col overflow-hidden relative group"
          >
            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
              <Mail className="w-6 h-6 text-zinc-900 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3">{t('landing.features.f3Title')}</h3>
            <p className="text-zinc-500 leading-relaxed text-sm">
              {t('landing.features.f3Desc')}
            </p>
          </motion.div>

          {/* Box 4: Span 2 Cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2 bg-zinc-900 rounded-2xl p-8 border border-zinc-800 flex flex-col sm:flex-row items-center sm:items-start sm:justify-between overflow-hidden relative"
          >
            <div className="max-w-md text-center sm:text-left mb-6 sm:mb-0 relative z-10">
              <h3 className="text-2xl font-bold text-white mb-3">{t('landing.features.f4Title')}</h3>
              <p className="text-zinc-400 leading-relaxed">
                {t('landing.features.f4Desc')}
              </p>
            </div>
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
              <LockKeyhole className="w-8 h-8 text-emerald-400" />
            </div>
            {/* Dark background decoration */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/50 to-transparent pointer-events-none"></div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
