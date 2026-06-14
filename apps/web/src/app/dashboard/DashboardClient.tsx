'use client'

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FileCode2, Check, Briefcase, Database, Wand2, LayoutTemplate, CheckCircle2 } from 'lucide-react';
import { Step1Goal } from '@/components/builder/Step1Goal';
import { Step2Source } from '@/components/builder/Step2Source';
import { Step3Customize } from '@/components/builder/Step3Customize';
import { Step4TemplateSelection } from '@/components/builder/Step4TemplateSelection';
import { CVSchema, CoverLetterSchema } from '@cv-generator/schema';
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

      // We start listening to Supabase Realtime for when ai_generation_logs receives a new entry for this user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate a unique channel name for this request to avoid "already subscribed" errors
      const channelName = `ai-generation-completion-${Date.now()}`;
      const channel = supabase.channel(channelName);

      // We listen for 'UPDATE' because the new reservation logic inserts the 'pending' row upfront,
      // and the Inngest background job UPDATES it to 'success' or 'failed'.
      channel.on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ai_generation_logs', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          // Ignore updates that are just setting it to pending
          if (payload.new.status === 'pending') return;

          // AI generation finished! 
          setIsLoading(false);
          supabase.removeChannel(channel);

          if (payload.new.status === 'failed') {
            toast.error(payload.new.error_message || t('builder.backgroundError'));
            return; // Stay on Step 3
          }

          setCurrentStep(4);

          // Fetch the latest documents to set their IDs
          const { data: latestDocs } = await supabase
            .from('resumes')
            .select('id, document_type')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(2);

          if (latestDocs && latestDocs.length > 0) {
            const cvDoc = latestDocs.find(d => d.document_type === 'cv');
            const clDoc = latestDocs.find(d => d.document_type === 'cover_letter');
            if (cvDoc) setCvId(cvDoc.id);
            if (clDoc) setClId(clDoc.id);
          }
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
    <div className="pb-20 px-4 xl:px-0 font-sans">
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
                  setIsLoading(true);
                  try {
                    if (cvId) {
                      await supabase.from('resumes').update({ template_id: cvTemplate }).eq('id', cvId);
                    }
                    if (clId) {
                      await supabase.from('resumes').update({ template_id: clTemplate }).eq('id', clId);
                    }
                  } catch (err) {
                    console.error("Failed to save template selection", err);
                  } finally {
                    setIsLoading(false);
                  }
                  
                  // The API already saved the drafts, so we can just navigate.
                  if (cvId && clId) {
                    // Bulk operation (CV + Cover Letter)
                    let isBlocked = false;
                    const cvWin = window.open(`/dashboard/edit/${cvId}`, '_blank');
                    if (!cvWin) isBlocked = true;

                    const clWin = window.open(`/dashboard/edit/${clId}`, '_blank');
                    if (!clWin) isBlocked = true;

                    if (isBlocked) {
                      toast.error(t('files.popupBlocked'), { duration: 5000 });
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
