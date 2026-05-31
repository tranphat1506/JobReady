"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { UploadCloud, Cpu, Download } from "lucide-react";

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      title: t('landing.howItWorks.s1Title'),
      desc: t('landing.howItWorks.s1Desc'),
      icon: UploadCloud,
    },
    {
      title: t('landing.howItWorks.s2Title'),
      desc: t('landing.howItWorks.s2Desc'),
      icon: Cpu,
    },
    {
      title: t('landing.howItWorks.s3Title'),
      desc: t('landing.howItWorks.s3Desc'),
      icon: Download,
    },
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative">
          
          {/* Left Column: Sticky Title */}
          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-32">
              <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 tracking-tight">
                {t('landing.howItWorks.title')}
              </h2>
              <p className="text-xl text-zinc-500 leading-relaxed mb-8">
                {t('landing.howItWorks.subtitle')}
              </p>
              
              {/* Optional Decoration on left side */}
              <div className="hidden lg:flex w-24 h-1 bg-zinc-900 mb-8 rounded-full"></div>
            </div>
          </div>

          {/* Right Column: Scrolling Steps */}
          <div className="lg:w-2/3">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-8 bottom-8 w-px bg-zinc-200 hidden md:block"></div>

              <div className="space-y-12">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5 }}
                      className="relative flex flex-col md:flex-row gap-6 md:gap-12"
                    >
                      {/* Step Indicator */}
                      <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-200 flex-shrink-0">
                        <Icon className="w-6 h-6 text-zinc-700" />
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 bg-zinc-50 border border-zinc-100 rounded-3xl p-8 md:p-10 hover:shadow-xl hover:shadow-zinc-200/40 transition-shadow duration-500">
                        <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                          {step.title}
                        </h3>
                        <p className="text-lg text-zinc-600 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
