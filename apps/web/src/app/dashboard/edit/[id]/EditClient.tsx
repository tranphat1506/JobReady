'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Step5ReviewEdit } from '@/components/builder/Step5ReviewEdit';

export default function EditClient({ resumeData }: { resumeData: any }) {
  const router = useRouter();

  // V2 Schema uses document_type instead of type
  const isCv = resumeData.document_type === 'cv';
  const isCl = resumeData.document_type === 'cover_letter';

  // Include matchAnalysis if it exists in the V2 schema
  const initialContent = resumeData.content || {};
  if (resumeData.match_analysis) {
    initialContent.matchAnalysis = resumeData.match_analysis;
  }

  const [result, setResult] = useState<any>({
    cv: isCv ? initialContent : undefined,
    coverLetter: isCl ? initialContent : undefined
  });

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <Step5ReviewEdit
        result={result}
        setResult={setResult}
        onReset={() => router.push('/dashboard/files')}
        cvTemplate={resumeData.template_id || 'harvard'}
        clTemplate={resumeData.template_id || 'standard-cover-letter'}
        showCV={isCv}
        showCL={isCl}
        cvId={isCv ? resumeData.id : null}
        clId={isCl ? resumeData.id : null}
        initialStatus={resumeData.status}
        onPrev={() => router.push('/dashboard/files')}
      />
    </div>
  );
}
