"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function FinalCTA() {
  const { t } = useTranslation();

  return (
    <section className="py-32 bg-zinc-900 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8 tracking-tight font-sans">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('landing.cta.subtitle')}
          </p>
          
          <Link href="/dashboard">
            <Button size="lg" className="h-16 px-10 text-lg gap-3 font-bold rounded-xl bg-primary hover:bg-emerald-600 text-white transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40">
              {t('landing.cta.button')}
              <ArrowRight className="w-6 h-6" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
