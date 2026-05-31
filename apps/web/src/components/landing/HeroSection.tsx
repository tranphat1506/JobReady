"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-background to-background"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 mb-8 text-sm font-medium tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>{t('landing.hero.badge')}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-foreground">
            {t('landing.hero.title1')} <br />
            <span className="">
              {t('landing.hero.title2')}
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('landing.hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base gap-2 font-semibold rounded-md transition-colors">
                <FileText className="w-5 h-5" />
                {t('landing.hero.ctaPrimary')}
              </Button>
            </Link>
            
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base gap-2 rounded-md font-semibold">
                {t('landing.hero.ctaSecondary')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
