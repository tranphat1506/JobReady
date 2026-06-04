'use client'

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FileCode2, Check, Briefcase, Database, Wand2, LayoutTemplate, CheckCircle2 } from 'lucide-react';
import { Step1Goal } from '@/components/builder/Step1Goal';
import { Step2Source } from '@/components/builder/Step2Source';
import { Step3Customize } from '@/components/builder/Step3Customize';
import { Step4TemplateSelection } from '@/components/builder/Step4TemplateSelection';
import { CVSchema, CoverLetterSchema } from '@cv-generator/schema';
import { saveJobDescription } from '@/actions/documentManagement';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const PDFPreview = dynamic(() => import('@/components/builder/PDFPreview'), { ssr: false, loading: () => <div className="w-full h-full bg-zinc-50 animate-pulse flex items-center justify-center text-zinc-400 border border-zinc-200">Loading Preview...</div> });

import { useBuilderStore } from '@/stores/useBuilderStore';

interface DashboardClientProps {
  hasMasterProfile: boolean;
  cvTemplate?: string;
  clTemplate?: string;
  cvId?: string;
  clId?: string;
}

export default function DashboardClient({ 
  hasMasterProfile,
  cvTemplate: initialCvTemplate,
  clTemplate: initialClTemplate,
  cvId: initialCvId,
  clId: initialClId 
}: DashboardClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ cv?: CVSchema; coverLetter?: CoverLetterSchema } | null>(null);

  // IDs of the drafts stored in the database
  const [cvId, setCvId] = useState<string | null>(null);
  const [clId, setClId] = useState<string | null>(null);

  const [cvTemplate, setCvTemplate] = useState('harvard');
  const [clTemplate, setClTemplate] = useState('standard-cover-letter');

  const { state, updateState, resetState } = useBuilderStore();

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleReset = () => {
    setCurrentStep(1);
    setResult(null);
    resetState();
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
      // Save JD first to get ID
      let savedJobId = undefined;
      if (state.jobDescription.trim()) {
        try {
          savedJobId = await saveJobDescription(state.jobDescription, 'Custom JD');
          if (savedJobId) formData.append('savedJobId', savedJobId);
        } catch (e) {
          console.error('Failed to save JD:', e);
        }
      }

      // Add templates to form data for atomic saving
      formData.append('cvTemplate', cvTemplate);
      formData.append('clTemplate', clTemplate);
      if (cvId) formData.append('cvId', cvId);
      if (clId) formData.append('clId', clId);

      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('error.system.internal') || 'Có lỗi xảy ra khi tạo CV');
      }

      // 202 Accepted - Inngest is processing
      toast('⏳ Hệ thống AI đang xử lý... Vui lòng đợi trong giây lát.', { duration: 5000, icon: '🤖' });
      
      // We start listening to Supabase Realtime for when ai_generation_logs receives a new entry for this user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase.channel('ai-generation-completion');
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ai_generation_logs', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          // AI generation finished! 
          setIsLoading(false);
          supabase.removeChannel(channel);
          
          toast.success(t('builder.step4Title') || 'Đã tạo tài liệu nháp thành công!');
          setCurrentStep(4);
          
          // Optionally fetch the latest CV ID to set it
          const { data: latestCv } = await supabase
            .from('resumes')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (latestCv) setCvId(latestCv.id);
        }
      ).subscribe();

    } catch (error: any) {
      setIsLoading(false);
      toast.error(error.message);
      console.error(error);
    }
  };

  const STEPS = [
    { id: 1, title: t('dashboard.steps.step1') || 'Mục Tiêu', desc: t('dashboard.steps.step1Desc') || 'Chọn loại CV & Cover Letter', icon: <Briefcase className="w-5 h-5" /> },
    { id: 2, title: t('dashboard.steps.step2') || 'Dữ Liệu', desc: t('dashboard.steps.step2Desc') || 'Cung cấp thông tin nền tảng', icon: <Database className="w-5 h-5" /> },
    { id: 3, title: t('dashboard.steps.step3') || 'Tuỳ Chỉnh AI', desc: t('dashboard.steps.step3Desc') || 'Chỉ định giọng văn & Prompt', icon: <Wand2 className="w-5 h-5" /> },
    { id: 4, title: t('dashboard.steps.step4') || 'Chọn Mẫu', desc: t('dashboard.steps.step4Desc') || 'Lựa chọn giao diện hiển thị', icon: <LayoutTemplate className="w-5 h-5" /> }
  ];

  // With background jobs, we determine what to show based on the goal, not result
  const showCV = state.goal === 'cv' || state.goal === 'both';
  const showCL = state.goal === 'cover_letter' || state.goal === 'both';

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 xl:px-0 font-sans">

      {/* AI Processing Overlay */}
      {isLoading && currentStep === 3 && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-5 max-w-sm text-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
            </div>
            <div>
              <p className="text-lg font-semibold text-zinc-900">AI đang xử lý...</p>
              <p className="text-sm text-zinc-500 mt-1">Hệ thống đang chạy nền. Bạn sẽ được chuyển sang bước tiếp theo ngay khi xong.</p>
            </div>
          </div>
        </div>
      )}

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
              <Step2Source state={state} updateState={updateState} onNext={handleNext} onBack={handleBack} hasMasterProfile={hasMasterProfile} />
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
                  // The API already saved the drafts, so we can just navigate.
                  if (cvId && clId) {
                    // Bulk operation (CV + Cover Letter)
                    const cvWin = window.open(`/dashboard/edit/${cvId}`, '_blank');
                    const clWin = window.open(`/dashboard/edit/${clId}`, '_blank');
                    if (!cvWin || !clWin) {
                      toast.error('Trình duyệt đã chặn Tab mới. Bạn có thể mở lại tài liệu ở danh sách bên dưới!', { duration: 5000 });
                    }
                    handleReset();
                    router.push('/dashboard/files');
                  } else if (cvId) {
                    // Single operation
                    handleReset();
                    router.push(`/dashboard/edit/${cvId}`);
                  } else if (clId) {
                    // Single operation
                    handleReset();
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
