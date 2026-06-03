import React from 'react';
import { ArrowLeft, Sparkles, Briefcase, Zap, AlignLeft } from 'lucide-react';
import { BuilderState } from '@/app/dashboard/page';
import { useTranslation } from '@/hooks/useTranslation';

interface Step3Props {
  state: BuilderState;
  updateState: (updates: Partial<BuilderState>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function Step3Customize({ state, updateState, onSubmit, onBack, isLoading }: Step3Props) {
  const { t } = useTranslation();
  const tones = [
    { id: 'Professional', label: t('builder.toneProfessional') || 'Chuyên nghiệp', icon: Briefcase, desc: t('builder.toneProfessionalDesc') || 'Khách quan, học thuật' },
    { id: 'Energetic', label: t('builder.toneEnergetic') || 'Năng động', icon: Zap, desc: t('builder.toneEnergeticDesc') || 'Tràn đầy năng lượng' },
    { id: 'Concise', label: t('builder.toneConcise') || 'Ngắn gọn', icon: AlignLeft, desc: t('builder.toneConciseDesc') || 'Xúc tích, đi thẳng vấn đề' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-3xl mx-auto">
      <div className="mb-6 border-b border-zinc-200 pb-2">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{t('builder.step3Title') || 'Tùy Chỉnh & JD'}</h2>
        <p className="text-zinc-500 text-sm mt-1">{t('builder.step3Subtitle') || 'Nhập JD và cá nhân hóa phong cách.'}</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-2">{t('builder.jdLabel') || 'Job Description (JD)'}</label>
          <textarea
            className="w-full min-h-40 p-3 text-sm border border-zinc-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-y transition-all bg-white shadow-sm"
            placeholder={t('builder.jdPlaceholder') || "Dán nội dung tin tuyển dụng vào đây..."}
            value={state.jobDescription}
            onChange={(e) => updateState({ jobDescription: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-2">{t('builder.targetLanguage') || 'Ngôn ngữ đích'}</label>
          <select
            className="w-full p-2.5 text-sm border border-zinc-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none bg-white shadow-sm transition-all"
            value={state.targetLanguage}
            onChange={(e) => updateState({ targetLanguage: e.target.value })}
          >
            <option value="English">{t('builder.langEn') || 'English (Tiếng Anh)'}</option>
            <option value="Vietnamese">{t('builder.langVi') || 'Tiếng Việt'}</option>
            <option value="Japanese">{t('builder.langJa') || 'Tiếng Nhật'}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-2">{t('builder.toneOfVoice') || 'Tone of Voice (Văn phong)'}</label>
          <div className="space-y-2">
            {tones.map((tone) => {
              const Icon = tone.icon;
              const isSelected = state.toneOfVoice === tone.id;
              return (
                <div
                  key={tone.id}
                  onClick={() => updateState({ toneOfVoice: tone.id })}
                  className={`cursor-pointer border p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-primary hover:shadow-sm'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-zinc-900'}`}>{tone.label}</h4>
                    <p className="text-xs text-zinc-500">{tone.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 mt-6 border-t border-zinc-200">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-2 text-zinc-500 px-4 py-2 hover:bg-zinc-100 font-semibold text-sm rounded-lg border border-transparent hover:text-zinc-900 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> {t('builder.back') || 'Quay lại'}
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading || !state.jobDescription.trim()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('builder.generating') || 'Đang xử lý...'}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> {t('builder.generateBtn') || 'Generate'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
