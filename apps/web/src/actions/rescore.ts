'use server';

import { inngest } from '@/inngest/client';
import { createClient } from '@/utils/supabase/server';
import { ErrorCodes } from '@/lib/constants/errors';
import { LedgerEvent } from '@/lib/constants/events';

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

  // Reserve AI credits
  const { data: logId, error: reserveError } = await supabase.rpc('reserve_ai_credits', {
    p_user_id: user.id,
    p_cost: 0, // Rescore does not cost credits currently, but we track tokens
    p_action_type: 'rescore_cv',
    p_metadata: { resume_id: resumeId, target_language: targetLanguage },
    p_message_code: LedgerEvent.RESCORE_CV_RESERVE
  });

  if (reserveError || !logId) {
    console.error('Reserve error:', reserveError);
    throw new Error(`Could not initialize AI tracking log: ${reserveError?.message || 'No logId'}`);
  }

  await inngest.send({
    name: 'cv/rescore',
    data: {
      userId: user.id,
      resumeId,
      jobDescription,
      cvContent,
      targetLanguage,
      logId,
    },
  });

  return { success: true };
}
