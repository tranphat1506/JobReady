import React, { useRef } from 'react';
import { Database, UploadCloud, ArrowRight, ArrowLeft } from 'lucide-react';
import { BuilderState } from '@/app/dashboard/page';
import { useTranslation } from '@/hooks/useTranslation';

interface Step2Props {
  state: BuilderState;
  updateState: (updates: Partial<BuilderState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Source({ state, updateState, onNext, onBack }: Step2Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      updateState({ file: e.target.files[0], sourceType: 'upload' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-3xl mx-auto">
      <div className="mb-6 border-b-2 border-black pb-2">
        <h2 className="text-xl font-bold text-black uppercase tracking-wider">{t('builder.step2Title') || 'Nguồn Dữ Liệu'}</h2>
        <p className="text-zinc-500 text-sm mt-1">{t('builder.step2Subtitle') || 'AI sẽ dùng thông tin từ đâu?'}</p>
      </div>

      <div className="space-y-4">
        {/* Lựa chọn 1: Master Profile */}
        <div
          onClick={() => updateState({ sourceType: 'master_profile' })}
          className={`cursor-pointer border-2 p-4 transition-all duration-200 ${state.sourceType === 'master_profile'
              ? 'border-black bg-zinc-100'
              : 'border-zinc-200 hover:border-black'
            }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 border-2 ${state.sourceType === 'master_profile' ? 'border-black bg-black text-white' : 'border-zinc-200 bg-white text-zinc-400'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-sm uppercase tracking-wide mb-1 ${state.sourceType === 'master_profile' ? 'text-black' : 'text-zinc-700'}`}>
                {t('builder.useMasterProfile') || 'Dùng Master Profile'}
              </h3>
              <p className="text-xs text-zinc-500 mb-2">
                {t('builder.useMasterProfileDesc') || 'Lấy toàn bộ thông tin đã lưu trên hệ thống.'}
              </p>
              <span className="inline-block px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider">
                {t('builder.recommended') || 'Khuyên dùng'}
              </span>
            </div>
          </div>
        </div>

        {/* Lựa chọn 2: Upload File */}
        <div
          onClick={() => {
            updateState({ sourceType: 'upload' });
            if (state.sourceType === 'upload') {
              fileInputRef.current?.click();
            }
          }}
          className={`cursor-pointer border-2 p-4 transition-all duration-200 ${state.sourceType === 'upload'
              ? 'border-black bg-zinc-100'
              : 'border-zinc-200 hover:border-black'
            }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 border-2 ${state.sourceType === 'upload' ? 'border-black bg-black text-white' : 'border-zinc-200 bg-white text-zinc-400'}`}>
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-sm uppercase tracking-wide mb-1 ${state.sourceType === 'upload' ? 'text-black' : 'text-zinc-700'}`}>
                {t('builder.uploadPdf') || 'Tải CV cũ lên (PDF)'}
              </h3>
              <p className="text-xs text-zinc-500 mb-3">
                {t('builder.uploadPdfDesc') || 'AI sẽ bóc tách và tối ưu lại từ file PDF.'}
              </p>

              {state.sourceType === 'upload' && (
                <div className="mt-2 border-2 border-black p-1 bg-white">
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="w-full py-1.5 bg-zinc-100 text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200"
                  >
                    {state.file ? state.file.name : (t('builder.selectPdf') || 'Chọn file PDF')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-black px-4 py-2 hover:bg-zinc-100 font-bold uppercase tracking-widest text-xs border-2 border-transparent hover:border-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('builder.back') || 'Quay lại'}
        </button>
        <button
          onClick={onNext}
          disabled={state.sourceType === 'upload' && !state.file}
          className="flex items-center gap-2 bg-black text-white px-6 py-2.5 font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('builder.next') || 'Tiếp tục'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
