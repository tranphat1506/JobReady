import React from 'react';
import { FileText, Mail, Layers, ArrowRight } from 'lucide-react';
import { BuilderState } from '@/stores/useBuilderStore';
import { useTranslation } from '@/hooks/useTranslation';

interface Step1Props {
  state: BuilderState;
  updateState: (updates: Partial<BuilderState>) => void;
  onNext: () => void;
}

export function Step1Goal({ state, updateState, onNext }: Step1Props) {
  const { t } = useTranslation();

  const options = [
    {
      id: 'cv' as const,
      title: t('builder.onlyCV') || 'Chỉ tạo CV',
      description: t('builder.onlyCVDesc') || 'Tối ưu CV của bạn dựa trên JD.',
      icon: FileText,
    },
    {
      id: 'cover_letter' as const,
      title: t('builder.onlyCL') || 'Chỉ tạo Cover Letter',
      description: t('builder.onlyCLDesc') || 'Viết thư ứng tuyển chuyên nghiệp.',
      icon: Mail,
    },
    {
      id: 'both' as const,
      title: t('builder.both') || 'Tạo Cả Hai',
      description: t('builder.bothDesc') || 'Combo hoàn hảo cho nhà tuyển dụng.',
      icon: Layers,
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-3xl mx-auto">
      <div className="mb-6 border-b border-zinc-200 pb-2">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{t('builder.step1Title') || 'Mục Tiêu'}</h2>
        <p className="text-zinc-500 text-sm mt-1">{t('builder.step1Subtitle') || 'Chọn mục tiêu để AI hỗ trợ.'}</p>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = state.goal === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => updateState({ goal: opt.id })}
              className={`cursor-pointer border p-4 flex items-center rounded-xl transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                  : 'border-zinc-200 bg-white hover:border-primary hover:shadow-sm'
              }`}
            >
              <div className={`p-3 mr-4 rounded-lg transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-zinc-900'}`}>
                  {opt.title}
                </h3>
                <p className="text-xs text-zinc-500">{opt.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          {t('builder.next') || 'Tiếp tục'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
