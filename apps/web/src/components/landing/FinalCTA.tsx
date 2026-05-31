"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function FinalCTA() {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Background pattern for visual interest without being "too modern" */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            {t('landing.cta.title')}
          </h2>
          <p className="text-lg md:text-xl text-emerald-50 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('landing.cta.subtitle')}
          </p>
          
          <Link href="/dashboard">
            <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-lg bg-white text-primary hover:bg-zinc-50 transition-colors shadow-lg shadow-black/10">
              {t('landing.cta.button')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
