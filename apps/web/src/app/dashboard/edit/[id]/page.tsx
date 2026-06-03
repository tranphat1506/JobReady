'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getResumeById } from '@/actions/documentManagement';
import { Step5ReviewEdit } from '@/components/builder/Step5ReviewEdit';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState<any>(null);
  
  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await getResumeById(id as string);
        setResumeData(data);
      } catch (err: any) {
        toast.error('Không thể tải tài liệu: ' + err.message);
        router.push('/dashboard/files');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!resumeData) return null;

  // Adapt the data structure for Step5ReviewEdit
  const result = {
    cv: resumeData.type === 'cv' ? resumeData.content : undefined,
    coverLetter: resumeData.type === 'cover_letter' ? resumeData.content : undefined
  };

  const setResultAdapter = (updater: any) => {
    setResumeData((prev: any) => {
      const currentState = {
        cv: prev.type === 'cv' ? prev.content : undefined,
        coverLetter: prev.type === 'cover_letter' ? prev.content : undefined
      };
      const newState = typeof updater === 'function' ? updater(currentState) : updater;
      return {
        ...prev,
        content: prev.type === 'cv' ? newState?.cv : newState?.coverLetter
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <Step5ReviewEdit
        result={result}
        setResult={setResultAdapter}
        onReset={() => router.push('/dashboard/files')}
        cvTemplate={resumeData.template_id || 'harvard'}
        clTemplate={resumeData.template_id || 'standard-cover-letter'}
        showCV={resumeData.type === 'cv'}
        showCL={resumeData.type === 'cover_letter'}
        cvId={resumeData.type === 'cv' ? resumeData.id : null}
        clId={resumeData.type === 'cover_letter' ? resumeData.id : null}
        initialStatus={resumeData.status}
        onPrev={() => router.push('/dashboard/files')}
      />
    </div>
  );
}
