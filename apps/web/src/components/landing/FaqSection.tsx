"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function FaqSection() {
  const { t } = useTranslation();
  
  const faqs = [
    { q: t('landing.faq.q1'), a: t('landing.faq.a1') },
    { q: t('landing.faq.q2'), a: t('landing.faq.a2') },
    { q: t('landing.faq.q3'), a: t('landing.faq.a3') },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Generate JSON-LD Schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  return (
    <section id="faq" className="py-24 bg-white border-t border-zinc-200">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-16">
          <p className="text-primary font-bold tracking-wide uppercase text-sm mb-4">
            {t('landing.faq.subtitle')}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
            {t('landing.faq.title')}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className={`border rounded-lg overflow-hidden transition-colors duration-300 ${isOpen ? 'bg-zinc-50 border-primary/30' : 'bg-white border-zinc-200'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className={`text-lg font-bold ${isOpen ? 'text-primary' : 'text-zinc-900'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-zinc-400'}`} />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
                >
                  <div className="px-6 pb-6 pt-2 text-zinc-600 leading-relaxed border-t border-zinc-100">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
