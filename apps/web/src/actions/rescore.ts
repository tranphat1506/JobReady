'use server';

import { inngest } from '@/inngest/client';
import { createClient } from '@/utils/supabase/server';
import { ErrorCodes } from '@/lib/constants/errors';

export async function triggerRescore(
  resumeId: string,
  cvContent: object,
  targetLanguage: string = 'Vietnamese'
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(ErrorCodes.UNAUTHORIZED);
  }

  // Ensure user owns this resume and get job_id
  const { data: resume, error: fetchError } = await supabase
    .from('resumes')
    .select('id, job_id')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !resume) {
    throw new Error(ErrorCodes.CANNOT_FETCH_DOCUMENT);
  }

  let jobDescription = '';
  if (resume.job_id) {
    const { data: jd } = await supabase
      .from('job_descriptions')
      .select('content')
      .eq('id', resume.job_id)
      .single();
    if (jd) jobDescription = jd.content;
  }

  await inngest.send({
    name: 'cv/rescore',
    data: {
      userId: user.id,
      resumeId,
      jobDescription,
      cvContent,
      targetLanguage,
    },
  });

  return { success: true };
}
