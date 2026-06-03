import React from 'react';
import { ArrowLeft, CheckCircle2, DownloadCloud } from 'lucide-react';
import { BuilderState } from '@/app/dashboard/page';
import { useTranslation } from '@/hooks/useTranslation';

interface Step4Props {
  state: BuilderState;
  onReset: () => void;
  cvTemplate: string;
  setCvTemplate: (v: string) => void;
  clTemplate: string;
  setClTemplate: (v: string) => void;
  showCV: boolean;
  showCL: boolean;
}

export function Step4Result({
  state,
  onReset,
  cvTemplate, setCvTemplate,
  clTemplate, setClTemplate,
  showCV, showCL
}: Step4Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6 border-b-2 border-black pb-4 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-black uppercase tracking-wider">{t('builder.step4Title') || 'Hoàn Tất!'}</h2>
        <p className="text-zinc-500 text-sm mt-1 max-w-62.5 mx-auto">
          {t('builder.step4Subtitle') || 'AI đã xử lý xong. Bạn có thể tải xuống hoặc xem trực tiếp tài liệu tại các thẻ bên phải.'}
        </p>
      </div>

      <div className="space-y-5">
        {showCV && (
          <div>
            <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
              {t('builder.cvTemplate') || 'CV Template'}
            </label>
            <select
              className="w-full p-2.5 text-sm border-2 border-zinc-200 focus:border-black focus:outline-none bg-white rounded-none transition-colors"
              value={cvTemplate}
              onChange={(e) => setCvTemplate(e.target.value)}
            >
              <option value="harvard">Harvard (Classic)</option>
              <option value="ats-simple">ATS Simple (Modern)</option>
            </select>
          </div>
        )}

        {showCL && (
          <div>
            <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
              {t('builder.clTemplate') || 'Cover Letter Template'}
            </label>
            <select
              className="w-full p-2.5 text-sm border-2 border-zinc-200 focus:border-black focus:outline-none bg-white rounded-none transition-colors"
              value={clTemplate}
              onChange={(e) => setClTemplate(e.target.value)}
            >
              <option value="standard-cover-letter">Standard Professional</option>
            </select>
          </div>
        )}
      </div>

      <div className="bg-zinc-100 p-4 border-2 border-zinc-200 mt-6 text-center text-xs text-zinc-500 rounded-lg">
        <DownloadCloud className="w-6 h-6 mx-auto mb-2 text-zinc-400" />
        <p>Bấm nút "Tải Xuống PDF" trên thẻ tài liệu để lưu file về máy tính.</p>
      </div>

      <div className="flex justify-center pt-6 mt-6 border-t-2 border-zinc-100">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-black px-6 py-2.5 hover:bg-zinc-100 font-bold uppercase tracking-widest text-xs border-2 border-transparent hover:border-zinc-300 transition-colors w-full justify-center"
        >
          <ArrowLeft className="w-4 h-4" /> {t('builder.startOver') || 'Bắt đầu lại'}
        </button>
      </div>
    </div>
  );
}
