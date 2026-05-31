"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

const steps = [
  {
    number: "01",
    icon: "fi fi-rr-file-edit",
    color: "bg-cyan-50 text-cyan-600 border-cyan-100",
    dotColor: "bg-cyan-500",
  },
  {
    number: "02",
    icon: "fi fi-rr-magic-wand",
    color: "bg-violet-50 text-violet-600 border-violet-100",
    dotColor: "bg-violet-500",
  },
  {
    number: "03",
    icon: "fi fi-rr-cloud-download",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    dotColor: "bg-emerald-500",
  },
];

export default function HowItWorks() {
  const { t } = useTranslation();

  const titles = [
    t('landing.howItWorks.s1Title'),
    t('landing.howItWorks.s2Title'),
    t('landing.howItWorks.s3Title'),
  ];
  const descs = [
    t('landing.howItWorks.s1Desc'),
    t('landing.howItWorks.s2Desc'),
    t('landing.howItWorks.s3Desc'),
  ];

  return (
    <section className="py-28 bg-white border-t border-zinc-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Heading */}
        <div className="text-center mb-20">
          <p className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase mb-3">
            {t('landing.howItWorks.subtitle')}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">
            {t('landing.howItWorks.title')}
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.666%+2rem)] right-[calc(16.666%+2rem)] h-px bg-zinc-200 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex flex-col items-center text-center relative z-10"
              >
                {/* Icon circle */}
                <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center mb-6 ${step.color}`}>
                  <i className={`${step.icon} text-3xl`} />
                </div>

                {/* Step number */}
                <span className="text-[11px] font-bold tracking-[0.18em] text-zinc-400 uppercase mb-2">
                  STEP {step.number}
                </span>

                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  {titles[index]}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-[220px]">
                  {descs[index]}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA inline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 flex justify-center"
        >
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-6 py-3 rounded-md hover:bg-zinc-700 transition-colors"
          >
            <i className="fi fi-rr-rocket-lunch text-base leading-none" />
            {t('landing.hero.ctaPrimary')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
