'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { FileCode2, Plus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-5xl">
      <div className="mb-8 border-b border-zinc-200 pb-5">
        <h1 className="text-3xl font-bold font-sans text-zinc-900 tracking-tight">
          {t('dashboard.createCv.title') || 'Tạo CV bằng AI'}
        </h1>
        <p className="mt-2 text-zinc-600">
          {t('dashboard.createCv.description') || 'Hãy dán Job Description vào để AI giúp bạn tối ưu CV chuẩn ATS nhé.'}
        </p>
      </div>

      {/* Blank Slate / Placeholder cho Split-view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột 1: Nhập JD */}
        <div className="bg-white border border-zinc-200 rounded-sm p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <FileCode2 className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-2">{t('dashboard.createCv.noJdTitle')}</h3>
          <p className="text-sm text-zinc-500 mb-6 max-w-xs">
            {t('dashboard.createCv.noJdDesc')}
          </p>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-sm text-sm font-bold hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" />
            {t('dashboard.createCv.addJdBtn')}
          </button>
        </div>

        {/* Cột 2: Preview CV */}
        <div className="bg-zinc-100 border border-zinc-200 border-dashed rounded-sm p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
          <p className="text-sm text-zinc-400 font-medium">
            {t('dashboard.createCv.previewPlaceholder')}
          </p>
        </div>
      </div>
    </div>
  )
}
