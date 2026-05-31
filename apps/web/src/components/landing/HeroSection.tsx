"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const { t } = useTranslation();
  const [typedText, setTypedText] = useState("");
  const fullText = "Analyzing Job Description... Extracting keywords: React, TypeScript, Node.js... Tailoring experience to match requirements... Optimizing for ATS... Done.";

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, [fullText]);

  return (
    <section className="relative overflow-hidden bg-white pt-20 pb-24 md:pt-32 md:pb-32 border-b border-zinc-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 mb-6 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>{t('landing.hero.badge')}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-zinc-900 leading-[1.1] font-sans">
              {t('landing.hero.title1')} <br />
              <span className="text-zinc-400">
                {t('landing.hero.title2')}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-500 mb-10 leading-relaxed max-w-lg">
              {t('landing.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base gap-2 font-semibold rounded-lg bg-primary hover:bg-emerald-600 text-white transition-all shadow-sm">
                  {t('landing.hero.ctaPrimary')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              
              <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                No credit card required
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive/Mockup UI */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden md:block"
          >
            {/* The Floating CV Mockup Card */}
            <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl border border-zinc-200 shadow-2xl shadow-zinc-200/50 overflow-hidden">
              
              {/* Fake Mac Header */}
              <div className="h-10 bg-zinc-50 border-b border-zinc-200 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
                <div className="mx-auto flex items-center gap-2 bg-white border border-zinc-200 rounded-md px-3 py-1">
                  <FileText className="w-3 h-3 text-zinc-400" />
                  <span className="text-[10px] text-zinc-500 font-mono">careergo-tailored-cv.pdf</span>
                </div>
              </div>

              {/* Fake CV Content */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="h-6 w-32 bg-zinc-900 rounded-sm mb-2"></div>
                    <div className="h-3 w-48 bg-zinc-200 rounded-sm"></div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">98</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-3 w-full bg-zinc-100 rounded-sm"></div>
                  <div className="h-3 w-5/6 bg-zinc-100 rounded-sm"></div>
                  <div className="h-3 w-4/6 bg-zinc-100 rounded-sm"></div>
                </div>

                <div className="mt-8">
                  <div className="h-4 w-24 bg-zinc-800 rounded-sm mb-4"></div>
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1"></div>
                      <div className="h-3 w-full bg-emerald-50 rounded-sm"></div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1"></div>
                      <div className="h-3 w-5/6 bg-emerald-50 rounded-sm"></div>
                    </div>
                  </div>
                </div>

                {/* Typing Overlay */}
                <div className="mt-8 p-4 bg-zinc-900 rounded-lg shadow-inner">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs text-zinc-400 font-mono uppercase">{t('landing.hero.aiTyping')}</span>
                  </div>
                  <p className="text-sm font-mono text-emerald-400 leading-relaxed min-h-[60px]">
                    {typedText}
                    <span className="animate-pulse">_</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white opacity-50 blur-2xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
