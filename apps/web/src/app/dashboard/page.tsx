'use client'

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FileCode2, Check, Briefcase, Database, Wand2, LayoutTemplate, CheckCircle2 } from 'lucide-react';
import { Step1Goal } from '@/components/builder/Step1Goal';
import { Step2Source } from '@/components/builder/Step2Source';
import { Step3Customize } from '@/components/builder/Step3Customize';
import { Step4TemplateSelection } from '@/components/builder/Step4TemplateSelection';
import { Step5ReviewEdit } from '@/components/builder/Step5ReviewEdit';
import { CVSchema, CoverLetterSchema } from '@cv-generator/schema';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const PDFPreview = dynamic(() => import('@/components/builder/PDFPreview'), { ssr: false, loading: () => <div className="w-full h-full bg-zinc-50 animate-pulse flex items-center justify-center text-zinc-400 border border-zinc-200">Loading Preview...</div> });

export interface BuilderState {
  goal: 'cv' | 'cover_letter' | 'both';
  sourceType: 'master_profile' | 'upload';
  file: File | null;
  jobDescription: string;
  targetLanguage: string;
  toneOfVoice: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ cv?: CVSchema; coverLetter?: CoverLetterSchema } | null>(null);

  const [cvTemplate, setCvTemplate] = useState('harvard');
  const [clTemplate, setClTemplate] = useState('standard-cover-letter');

  const [state, setState] = useState<BuilderState>({
    goal: 'cv',
    sourceType: 'master_profile',
    file: null,
    jobDescription: '',
    targetLanguage: 'Vietnamese',
    toneOfVoice: 'Professional',
  });

  const updateState = (updates: Partial<BuilderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleReset = () => {
    setCurrentStep(1);
    setResult(null);
  };

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('goal', state.goal);
      formData.append('sourceType', state.sourceType);
      formData.append('jobDescription', state.jobDescription);
      formData.append('targetLanguage', state.targetLanguage);
      formData.append('toneOfVoice', state.toneOfVoice);
      if (state.sourceType === 'upload' && state.file) {
        formData.append('file', state.file);
      }

      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('error.system.internal') || 'Có lỗi xảy ra khi tạo CV');
      }

      const data = await response.json();
      setResult(data);
      setCurrentStep(4);
      toast.success(t('builder.step4Title') || 'Đã tạo tài liệu thành công!');
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const STEPS = [
    { id: 1, title: t('dashboard.steps.step1') || 'Mục Tiêu', desc: t('dashboard.steps.step1Desc') || 'Chọn loại CV & Cover Letter', icon: <Briefcase className="w-5 h-5" /> },
    { id: 2, title: t('dashboard.steps.step2') || 'Dữ Liệu', desc: t('dashboard.steps.step2Desc') || 'Cung cấp thông tin nền tảng', icon: <Database className="w-5 h-5" /> },
    { id: 3, title: t('dashboard.steps.step3') || 'Tuỳ Chỉnh AI', desc: t('dashboard.steps.step3Desc') || 'Chỉ định giọng văn & Prompt', icon: <Wand2 className="w-5 h-5" /> },
    { id: 4, title: t('dashboard.steps.step4') || 'Chọn Mẫu', desc: t('dashboard.steps.step4Desc') || 'Lựa chọn giao diện hiển thị', icon: <LayoutTemplate className="w-5 h-5" /> },
    { id: 5, title: t('dashboard.steps.step5') || 'Hoàn Tất', desc: t('dashboard.steps.step5Desc') || 'Chỉnh sửa & Tải xuống', icon: <CheckCircle2 className="w-5 h-5" /> }
  ];

  const showCV = result?.cv != null;
  const showCL = result?.coverLetter != null;

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 xl:px-0 font-sans">
      <div className="mb-8 border-b border-zinc-200 pb-5 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight uppercase">
            {t('builder.title') || 'AI Resume Builder'}
          </h1>
          <p className="mt-2 text-zinc-500 font-medium text-sm">
            {t('builder.subtitle') || 'Tạo CV và Cover Letter cá nhân hóa chuẩn ATS chỉ trong 4 bước đơn giản.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: WIZARD */}
        <div className="lg:col-span-5 flex flex-col space-y-8">

          {/* Progress Indicator (Black & White style) */}
          <div className="relative">
            <div className="absolute left-0 top-4 transform -translate-y-1/2 w-full h-0.5 bg-zinc-200 z-0"></div>
            <div
              className="absolute left-0 top-4 transform -translate-y-1/2 h-0.5 bg-black z-0 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />

            <div className="flex justify-between relative z-10">
              {STEPS.map((step) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${isCompleted ? 'bg-black text-white border-black' :
                          isCurrent ? 'bg-white text-black border-black ring-4 ring-zinc-100' :
                            'bg-white text-zinc-300 border-zinc-200'
                        }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider hidden sm:block ${isCurrent ? 'text-black' : 'text-zinc-400'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wizard Content Box */}
          <div className="bg-white border-2 border-zinc-200 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            {currentStep === 1 && (
              <Step1Goal state={state} updateState={updateState} onNext={handleNext} />
            )}
            {currentStep === 2 && (
              <Step2Source state={state} updateState={updateState} onNext={handleNext} onBack={handleBack} />
            )}
            {currentStep === 3 && (
              <Step3Customize state={state} updateState={updateState} onSubmit={handleGenerate} onBack={handleBack} isLoading={isLoading} />
            )}
            {currentStep === 4 && (
              <Step4TemplateSelection
                state={state}
                cvTemplate={cvTemplate}
                setCvTemplate={setCvTemplate}
                clTemplate={clTemplate}
                setClTemplate={setClTemplate}
                showCV={showCV}
                showCL={showCL}
                onPrev={() => setCurrentStep(3)}
                onNext={() => setCurrentStep(5)}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW (HIDDEN IN STEP 5 AS IT TAKES FULL WIDTH) */}
        {currentStep < 5 && (
          <div className="lg:col-span-7 transition-all duration-500 min-h-175 border-2 border-zinc-200 bg-zinc-50 flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            {currentStep < 4 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-400">
                <FileCode2 className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium text-sm tracking-widest uppercase">{t('dashboard.previewArea') || 'Preview Area'}</p>
                <p className="text-xs mt-2 max-w-xs">{t('dashboard.previewAreaDesc') || 'Hoàn thành các bước bên trái để AI tiến hành tạo và hiển thị tài liệu tại đây.'}</p>
              </div>
            ) : (
              <div className="flex-1 w-full h-full p-8 flex items-center justify-center bg-zinc-50">
                <div className="text-center text-zinc-400">
                  <LayoutTemplate className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium text-sm tracking-widest uppercase">{t('dashboard.chooseTemplate') || 'Chọn Mẫu & Tiếp Tục'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FULL SCREEN STEP 5 */}
      {currentStep === 5 && (
        <div className="fixed inset-0 z-50 bg-white">
          <Step5ReviewEdit
            result={result}
            setResult={setResult}
            onReset={handleReset}
            cvTemplate={cvTemplate}
            clTemplate={clTemplate}
            showCV={showCV}
            showCL={showCL}
            onPrev={() => setCurrentStep(4)}
          />
        </div>
      )}
    </div>
  );
}
