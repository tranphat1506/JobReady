import React, { useRef, useEffect, useState } from 'react';
import { Database, UploadCloud, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { BuilderState } from '@/stores/useBuilderStore';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';

interface Step2Props {
  state: BuilderState;
  updateState: (updates: Partial<BuilderState>) => void;
  onNext: () => void;
  onBack: () => void;
  hasMasterProfile: boolean;
}

export function Step2Source({ state, updateState, onNext, onBack, hasMasterProfile }: Step2Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  
  const isProfileEmpty = !hasMasterProfile;

  useEffect(() => {
    // If profile is empty and current selection is master_profile, switch to upload to be safe
    if (isProfileEmpty && state.sourceType === 'master_profile') {
      updateState({ sourceType: 'upload' });
    }
  }, [state.sourceType, updateState, isProfileEmpty]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      updateState({ file: e.target.files[0], sourceType: 'upload' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-3xl mx-auto">
      <div className="mb-6 border-b border-zinc-200 pb-2">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{t('builder.step2Title') || 'Nguồn Dữ Liệu'}</h2>
        <p className="text-zinc-500 text-sm mt-1">{t('builder.step2Subtitle') || 'AI sẽ dùng thông tin từ đâu?'}</p>
      </div>

      <div className="space-y-4">
        {/* Lựa chọn 1: Master Profile */}
        <div
          onClick={() => updateState({ sourceType: 'master_profile' })}
          className={`cursor-pointer border p-4 rounded-xl transition-all duration-200 ${state.sourceType === 'master_profile'
              ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
              : 'border-zinc-200 bg-white hover:border-primary hover:shadow-sm'
            }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg transition-colors ${state.sourceType === 'master_profile' ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-500'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">{t('builder.sourceProfile') || 'Dùng Master Profile'}</h3>
              {isProfileEmpty ? (
                <p className="text-xs text-amber-600 mt-1 line-clamp-2">{t('builder.sourceProfileEmpty') || 'Bạn chưa có dữ liệu Master Profile.'}</p>
              ) : (
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{t('builder.sourceProfileDesc') || 'Sử dụng dữ liệu từ Master Profile đã thiết lập.'}</p>
              )}
              
              {isProfileEmpty ? (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 text-[10px] font-semibold rounded-md w-fit">
                    <AlertTriangle className="w-3 h-3" /> Master Profile trống!
                  </span>
                  <Link href="/dashboard/profile" target="_blank" className="text-xs text-primary font-medium hover:underline w-fit">
                    + Cập nhật Master Profile ngay
                  </Link>
                </div>
              ) : (
                <span className="inline-block px-2.5 py-1 bg-primary text-white text-[10px] font-semibold rounded-md">
                  {t('builder.recommended') || 'Khuyên dùng'}
                </span>
              )}
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
          className={`cursor-pointer border p-4 rounded-xl transition-all duration-200 ${state.sourceType === 'upload'
              ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
              : 'border-zinc-200 bg-white hover:border-primary hover:shadow-sm'
            }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg transition-colors ${state.sourceType === 'upload' ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-500'}`}>
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-sm mb-1 ${state.sourceType === 'upload' ? 'text-primary' : 'text-zinc-900'}`}>
                {t('builder.uploadPdf') || 'Tải CV cũ lên (PDF)'}
              </h3>
              <p className="text-xs text-zinc-500 mb-3">
                {t('builder.uploadPdfDesc') || 'AI sẽ bóc tách và tối ưu lại từ file PDF.'}
              </p>

              {state.sourceType === 'upload' && (
                <div className="mt-2 border border-primary p-1 bg-white rounded-lg">
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="w-full py-2 bg-zinc-100 text-zinc-900 text-xs font-semibold rounded-md hover:bg-zinc-200 transition-colors"
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
          className="flex items-center gap-2 text-zinc-500 px-4 py-2 hover:bg-zinc-100 font-semibold text-sm rounded-lg border border-transparent hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('builder.back') || 'Quay lại'}
        </button>
        <button
          onClick={onNext}
          disabled={
            (state.sourceType === 'upload' && !state.file) || 
            (state.sourceType === 'master_profile' && isProfileEmpty) ||
            loadingProfile
          }
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {t('builder.next') || 'Tiếp tục'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
