import React from 'react';
import { ArrowLeft, ArrowRight, LayoutTemplate, FileText } from 'lucide-react';
import { BuilderState } from '@/stores/useBuilderStore';
import { useTranslation } from '@/hooks/useTranslation';

interface Step4Props {
  state: BuilderState;
  cvTemplate: string;
  setCvTemplate: (v: string) => void;
  clTemplate: string;
  setClTemplate: (v: string) => void;
  showCV: boolean;
  showCL: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const CV_TEMPLATES = [
  {
    id: 'harvard',
    name: 'Harvard Classic',
    description: 'Chuyên nghiệp, truyền thống, phù hợp môi trường học thuật và doanh nghiệp lớn.',
    mockupClass: 'bg-gradient-to-br from-zinc-100 to-zinc-300 border-zinc-400'
  },
  {
    id: 'ats-simple',
    name: 'ATS Modern',
    description: 'Đơn giản, tối giản, tối ưu 100% cho hệ thống quét tự động ATS.',
    mockupClass: 'bg-white border-zinc-200 shadow-sm'
  }
];

const CL_TEMPLATES = [
  {
    id: 'standard-cover-letter',
    name: 'Standard Professional',
    description: 'Bố cục chuẩn mực cho mọi ngành nghề.',
    mockupClass: 'bg-zinc-50 border-zinc-200'
  }
];

export function Step4TemplateSelection({
  cvTemplate, setCvTemplate,
  clTemplate, setClTemplate,
  showCV, showCL,
  onPrev, onNext
}: Step4Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-12">
      <div className="mb-6 border-b border-zinc-200 pb-4">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <LayoutTemplate className="w-6 h-6" /> {t('builder.step4Title') || 'Chọn Mẫu Giao Diện'}
        </h2>
        <p className="text-zinc-500 text-sm mt-1">
          {t('builder.step4Subtitle') || 'Lựa chọn bố cục hiển thị phù hợp nhất với phong cách của bạn.'}
        </p>
      </div>

      {showCV && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-zinc-800">
            <FileText className="w-4 h-4 text-primary" /> {t('builder.cvTemplateLabel') || 'Mẫu CV (Sơ yếu lý lịch)'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CV_TEMPLATES.map(template => (
              <div
                key={template.id}
                onClick={() => setCvTemplate(template.id)}
                className={`cursor-pointer border p-4 flex flex-col gap-3 rounded-xl transition-all ${cvTemplate === template.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm -translate-y-1'
                    : 'border-zinc-200 bg-white hover:border-primary hover:shadow-sm'
                  }`}
              >
                {/* Visual Mockup */}
                <div className={`w-full aspect-[1/1.4] rounded-lg border p-4 flex flex-col gap-2 ${template.mockupClass}`}>
                  <div className="h-4 bg-zinc-300 rounded-sm w-3/4 mx-auto mb-2"></div>
                  <div className="w-full h-2 bg-zinc-200 rounded-sm"></div>
                  <div className="flex justify-between items-center w-full">
                    <div className="w-1/2 h-2 bg-zinc-300 rounded"></div>
                    <div className="w-1/4 h-2 bg-zinc-300 rounded"></div>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 rounded mt-1"></div>
                  <div className="w-5/6 h-1.5 bg-zinc-200 rounded"></div>
                </div>
                <div>
                  <h4 className="font-bold uppercase text-sm">{t(`builder.template_${template.id}_name`) || template.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1">{t(`builder.template_${template.id}_desc`) || template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCL && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-zinc-800">
            <FileText className="w-4 h-4 text-primary" /> {t('builder.clTemplateLabel') || 'Mẫu Cover Letter (Thư ngỏ)'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CL_TEMPLATES.map(template => (
              <div
                key={template.id}
                onClick={() => setClTemplate(template.id)}
                className={`cursor-pointer border p-4 flex flex-col gap-3 rounded-xl transition-all ${clTemplate === template.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm -translate-y-1'
                    : 'border-zinc-200 bg-white hover:border-primary hover:shadow-sm'
                  }`}
              >
                <div className={`w-full aspect-[1/1.4] rounded-lg border p-4 flex flex-col gap-2 ${template.mockupClass}`}>
                  <div className="w-1/2 h-3 bg-zinc-300 rounded-sm mb-4"></div>
                  <div className="w-full h-2 bg-zinc-200 rounded-sm mt-4"></div>
                  <div className="w-full h-2 bg-zinc-200 rounded-sm"></div>
                  <div className="h-2 bg-zinc-200 rounded-sm w-4/5"></div>
                  <div className="w-full h-2 bg-zinc-200 rounded-sm mt-2"></div>
                  <div className="h-2 bg-zinc-200 rounded-sm w-3/4"></div>
                </div>
                <div>
                  <h4 className="font-bold uppercase text-sm">{t(`builder.template_${template.id}_name`) || template.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1">{t(`builder.template_${template.id}_desc`) || template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 pt-4 border-t border-zinc-200 mt-8">
        <button
          onClick={onPrev}
          className="flex-1 flex items-center justify-center gap-2 text-zinc-500 px-6 py-3 hover:bg-zinc-100 font-semibold text-sm rounded-lg border border-transparent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('builder.back') || 'Quay lại'}
        </button>
        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
        >
          {t('builder.next') || 'Tiếp tục'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
