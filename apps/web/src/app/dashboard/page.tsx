'use client'

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FileCode2, Check, Briefcase, Database, Wand2, LayoutTemplate, CheckCircle2 } from 'lucide-react';
import { Step1Goal } from '@/components/builder/Step1Goal';
import { Step2Source } from '@/components/builder/Step2Source';
import { Step3Customize } from '@/components/builder/Step3Customize';
import { Step4TemplateSelection } from '@/components/builder/Step4TemplateSelection';
import { CVSchema, CoverLetterSchema } from '@cv-generator/schema';
import { saveDocument, saveJobDescription } from '@/actions/documentManagement';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ cv?: CVSchema; coverLetter?: CoverLetterSchema } | null>(null);

  // Draft modal state
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);

  // IDs of the drafts stored in the database
  const [cvId, setCvId] = useState<string | null>(null);
  const [clId, setClId] = useState<string | null>(null);

  const [cvTemplate, setCvTemplate] = useState('harvard');
  const [clTemplate, setClTemplate] = useState('standard-cover-letter');

  useEffect(() => {
    async function checkDrafts() {
      try {
        const drafts = await getDrafts();
        if (drafts) {
          setResult(drafts.result);
          setCvId(drafts.draftIds.cvId);
          setClId(drafts.draftIds.clId);
          setCurrentStep(5);
        }
      } catch (e) {
        console.error('Error fetching drafts:', e);
      }
    }
    checkDrafts();
  }, []);

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

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
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

      // Save JD and Drafts automatically
      let savedJobId = undefined;
      if (state.jobDescription.trim()) {
        try {
          savedJobId = await saveJobDescription(state.jobDescription, 'Custom JD');
        } catch (e) {
          console.error('Failed to save JD:', e);
        }
      }

      if (data.cv) {
        const id = await saveDocument(data.cv, 'cv', data.cv.personal?.fullName ? `CV - ${data.cv.personal.fullName}` : 'Untitled CV', undefined, savedJobId, cvTemplate, 'draft');
        setCvId(id || null);
      }

      if (data.coverLetter) {
        const id = await saveDocument(data.coverLetter, 'cover_letter', data.coverLetter.personal?.fullName ? `Cover Letter - ${data.coverLetter.personal.fullName}` : 'Untitled Cover Letter', undefined, savedJobId, clTemplate, 'draft');
        setClId(id || null);
      }

      setCurrentStep(4);
      toast.success(t('builder.step4Title') || 'Đã tạo tài liệu nháp thành công!');
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
    { id: 4, title: t('dashboard.steps.step4') || 'Chọn Mẫu', desc: t('dashboard.steps.step4Desc') || 'Lựa chọn giao diện hiển thị', icon: <LayoutTemplate className="w-5 h-5" /> }
  ];

  const showCV = result?.cv != null;
  const showCL = result?.coverLetter != null;

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 xl:px-0 font-sans">

      <div className="mb-8 border-b border-zinc-200 pb-5 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
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

          {/* Progress Indicator (SaaS style) */}
          <div className="relative">
            <div className="absolute left-0 top-4 transform -translate-y-1/2 w-full h-0.5 bg-zinc-200 z-0"></div>
            <div
              className="absolute left-0 top-4 transform -translate-y-1/2 h-0.5 bg-primary z-0 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />

            <div className="flex justify-between relative z-10">
              {STEPS.map((step) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 border-2 ${isCompleted ? 'bg-primary text-white border-primary' :
                        isCurrent ? 'bg-white text-primary border-primary ring-4 ring-primary/20' :
                          'bg-white text-zinc-400 border-zinc-200'
                        }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <span className={`mt-2 text-xs font-medium hidden sm:block ${isCurrent ? 'text-primary font-semibold' : 'text-zinc-500'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wizard Content Box */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
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
                onNext={async () => {
                  // We update the templates for the drafts one last time
                  if (cvId) await saveDocument(result!.cv!, 'cv', result!.cv!.personal?.fullName ? `CV - ${result!.cv!.personal.fullName}` : 'Untitled CV', undefined, undefined, cvTemplate, 'draft', cvId);
                  if (clId) await saveDocument(result!.coverLetter!, 'cover_letter', result!.coverLetter!.personal?.fullName ? `Cover Letter - ${result!.coverLetter!.personal.fullName}` : 'Untitled Cover Letter', undefined, undefined, clTemplate, 'draft', clId);

                  if (cvId) {
                    router.push(`/dashboard/edit/${cvId}`);
                  } else if (clId) {
                    router.push(`/dashboard/edit/${clId}`);
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW (HIDDEN IN STEP 5 AS IT TAKES FULL WIDTH) */}
        {currentStep < 5 && (
          <div className="lg:col-span-7 transition-all duration-500 min-h-100 border border-zinc-200 rounded-xl bg-slate-50 flex flex-col shadow-sm overflow-hidden">
            {currentStep < 4 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-400">
                <FileCode2 className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-semibold text-sm">{t('dashboard.previewArea') || 'Preview Area'}</p>
                <p className="text-xs mt-2 max-w-xs">{t('dashboard.previewAreaDesc') || 'Hoàn thành các bước bên trái để AI tiến hành tạo và hiển thị tài liệu tại đây.'}</p>
              </div>
            ) : (
              <div className="flex-1 w-full h-full p-8 flex items-center justify-center bg-slate-50">
                <div className="text-center text-zinc-400">
                  <LayoutTemplate className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold text-sm">{t('dashboard.chooseTemplate') || 'Chọn Mẫu & Tiếp Tục'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
