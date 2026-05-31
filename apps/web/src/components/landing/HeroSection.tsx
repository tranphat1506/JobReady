"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 items-center">

          {/* Left Column: Text */}
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 mb-6 text-sm font-semibold tracking-wide">
              <span>{t('landing.hero.badge')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-zinc-900 leading-[1.2]">
              {t('landing.hero.title')}
            </h1>

            <p className="text-lg text-zinc-600 mb-8 leading-relaxed max-w-lg">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="cursor-pointer group w-full h-14 px-8 text-base font-semibold rounded-lg bg-primary hover:bg-emerald-700 text-white hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200">
                  {t('landing.hero.ctaPrimary')}
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="cursor-pointer group w-full h-14 px-8 text-base font-semibold rounded-lg text-zinc-700 border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200">
                  <PlayCircle className="w-5 h-5 mr-2 text-zinc-500 transition-transform group-hover:scale-110" />
                  {t('landing.hero.ctaSecondary')}
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 text-sm text-zinc-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {t('landing.hero.noCreditCard')}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {t('landing.hero.freePdf')}
              </div>
            </div>
          </div>

          {/* Right Column: Static Image / Mockup */}
          <div className="lg:w-1/2 w-full mt-12 lg:mt-0">
            <div className="relative w-full max-w-lg mx-auto flex items-center justify-center min-h-[550px]">

              {/* Backdrop Canvas */}
              <div className="absolute inset-0 bg-zinc-50 rounded-3xl border border-zinc-200 shadow-xl z-0"></div>

              {/* JD Mockup (Front Left) */}
              <div className="absolute top-12 left-2 w-[70%] bg-white border border-zinc-200 rounded shadow-xl p-4 transform-gpu -rotate-[10deg] -translate-x-4 -translate-y-6 opacity-95 hover:opacity-100 hover:z-30 hover:-translate-y-10 hover:-translate-x-8 transition-all duration-500 z-20 font-sans cursor-default hidden sm:block antialiased">
                <div className="border-b border-zinc-200 pb-2 mb-3">
                  <h3 className="text-xs font-bold text-zinc-800">{t('landing.hero.mockCv.jdTitle')}</h3>
                </div>
                <div className="space-y-2 text-[8px] text-zinc-500">
                  <p className="leading-relaxed mb-3">{t('landing.hero.mockCv.jdDesc')}</p>

                  <div className="font-bold text-zinc-700">{t('landing.hero.mockCv.jdReq')}</div>
                  <ul className="list-disc pl-3 space-y-1">
                    <li>{t('landing.hero.mockCv.jdReq1A')}<span className="bg-emerald-100 text-emerald-700 px-0.5 rounded">{t('landing.hero.mockCv.jdReq1High')}</span>{t('landing.hero.mockCv.jdReq1B')}</li>
                    <li>{t('landing.hero.mockCv.jdReq2A')}<span className="bg-emerald-100 text-emerald-700 px-0.5 rounded">{t('landing.hero.mockCv.jdReq2High')}</span>{t('landing.hero.mockCv.jdReq2B')}</li>
                    <li>{t('landing.hero.mockCv.jdReq3A')}<span className="bg-emerald-100 text-emerald-700 px-0.5 rounded">{t('landing.hero.mockCv.jdReq3High')}</span>{t('landing.hero.mockCv.jdReq3B')}</li>
                  </ul>
                </div>
              </div>

              {/* Cover Letter Mockup (Front Right) */}
              <div className="absolute bottom-12 right-2 w-[70%] bg-white border border-zinc-200 rounded shadow-xl p-4 transform-gpu rotate-[10deg] translate-x-4 translate-y-6 opacity-95 hover:opacity-100 hover:z-30 hover:translate-y-10 hover:translate-x-8 transition-all duration-500 z-20 font-sans cursor-default hidden sm:block antialiased">
                <div className="text-right mb-4">
                  <h3 className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest">{t('landing.hero.mockCv.name')}</h3>
                  <div className="text-[7px] text-zinc-500">nguyenvana@email.com</div>
                </div>
                <div className="space-y-2 text-[8px] text-zinc-600 leading-relaxed">
                  <div className="font-bold">{t('landing.hero.mockCv.clDear')}</div>
                  <p className="mt-2">{t('landing.hero.mockCv.clP1')}</p>
                  <div className="pt-2">
                    <p>{t('landing.hero.mockCv.clSign')}</p>
                    <p className="font-bold">{t('landing.hero.mockCv.name')}</p>
                  </div>
                </div>
              </div>

              {/* ATS Resume Mockup (Back Center) */}
              <div className="relative z-10 w-[85%] bg-white border border-zinc-200 rounded-xl shadow-lg p-5 sm:p-6 flex flex-col font-sans select-none transform-gpu hover:scale-[1.02] hover:z-30 transition-all duration-500 opacity-90 hover:opacity-100 antialiased">

                {/* CV Header: Name & Contact */}
                <div className="text-center mb-6 border-b-[1.5px] border-zinc-800 pb-4">
                  <h2 className="text-xl font-bold text-zinc-900 tracking-widest uppercase mb-2">{t('landing.hero.mockCv.name')}</h2>
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-zinc-600">
                    <span>{t('landing.hero.mockCv.contactLoc')}</span>
                    <span className="w-1 h-1 bg-zinc-300 rounded-full hidden sm:block"></span>
                    <span>nguyenvana@email.com</span>
                    <span className="w-1 h-1 bg-zinc-300 rounded-full hidden sm:block"></span>
                    <span>+84 987 654 321</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 text-[9px] text-zinc-800 leading-relaxed">

                  {/* Section: Experience */}
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-zinc-200 mb-2 pb-1">{t('landing.hero.mockCv.experience')}</h3>
                    <div className="space-y-3">
                      {/* Job 1 */}
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between font-bold mb-0.5">
                          <span>{t('landing.hero.mockCv.job1Title')}</span>
                          <span>{t('landing.hero.mockCv.job1Date')}</span>
                        </div>
                        <div className="italic text-zinc-600 mb-1">{t('landing.hero.mockCv.job1Location')}</div>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>{t('landing.hero.mockCv.job1Desc1')}</li>
                          <li className="relative">
                            {t('landing.hero.mockCv.job1Desc2A')}
                            <span className="bg-emerald-100 font-bold text-emerald-800 px-1 rounded">{t('landing.hero.mockCv.job1Desc2High')}</span>
                            {t('landing.hero.mockCv.job1Desc2B')}
                            {/* AI Highlight Indicator */}
                            <span className="absolute -left-6 top-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          </li>
                          <li>{t('landing.hero.mockCv.job1Desc3')}</li>
                        </ul>
                      </div>

                      {/* Job 2 */}
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between font-bold mb-0.5">
                          <span>{t('landing.hero.mockCv.job2Title')}</span>
                          <span>{t('landing.hero.mockCv.job2Date')}</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>{t('landing.hero.mockCv.job2Desc1')}</li>
                          <li>{t('landing.hero.mockCv.job2Desc2')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Section: Education */}
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-zinc-200 mb-2 pb-1">{t('landing.hero.mockCv.education')}</h3>
                    <div className="flex flex-col sm:flex-row justify-between font-bold">
                      <span>{t('landing.hero.mockCv.eduTitle')}</span>
                      <span>{t('landing.hero.mockCv.eduDate')}</span>
                    </div>
                    <div className="italic text-zinc-600">{t('landing.hero.mockCv.eduSchool')}</div>
                  </div>

                  {/* Section: Skills */}
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-zinc-200 mb-2 pb-1">{t('landing.hero.mockCv.skills')}</h3>
                    <div>
                      <span className="font-bold">{t('landing.hero.mockCv.languages')}</span> {t('landing.hero.mockCv.skillLangList')}<br />
                      <span className="font-bold">{t('landing.hero.mockCv.frameworks')}</span> <span className="bg-emerald-100 text-emerald-800 font-bold px-1 rounded">{t('landing.hero.mockCv.skillFrameHigh')}</span>{t('landing.hero.mockCv.skillFrameRest')}<br />
                      <span className="font-bold">{t('landing.hero.mockCv.tools')}</span> {t('landing.hero.mockCv.skillToolStart')}<span className="bg-emerald-100 text-emerald-800 font-bold px-1 rounded">{t('landing.hero.mockCv.skillToolHigh')}</span>{t('landing.hero.mockCv.skillToolEnd')}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
