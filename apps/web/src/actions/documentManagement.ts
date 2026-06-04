'use server';

import { createClient } from '@/utils/supabase/server';
import { CVSchema, CoverLetterSchema } from '@cv-generator/schema';
import { withAuditLog } from '@/utils/auditLogger';

export interface SavedDocument {
  id: string;
  user_id: string;
  profile_id: string;
  job_id: string | null;
  type: 'cv' | 'cover_letter';
  name: string;
  status?: string;
  template_id?: string;
  metadata?: any;
  resume_versions?: { score?: number; match_analysis?: any }[];
  created_at: string;
  updated_at: string;
}

export async function saveJobDescription(content: string, title: string = 'Untitled JD') {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('job_descriptions')
    .insert({
      user_id: user.id,
      company: '',
      title: title,
      content: content
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function checkMasterProfileEmpty(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return true;

  const { data, error } = await supabase
    .from('master_profiles')
    .select('content')
    .eq('user_id', user.id)
    .single();

  if (error || !data || !data.content) return true;

  // Check if content has keys, e.g. personal, experience...
  return Object.keys(data.content).length === 0;
}

export async function getUserLimits() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase
    .from('users')
    .select('unlocked_cv_slots, unlocked_cl_slots')
    .eq('id', user.id)
    .single();

  const cvLimit = userData?.unlocked_cv_slots ?? 1;
  const clLimit = userData?.unlocked_cl_slots ?? 1;

  const { data: cvData } = await supabase
    .from('resumes')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'cv')
    .eq('status', 'completed');

  const { data: clData } = await supabase
    .from('resumes')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'cover_letter')
    .eq('status', 'completed');

  return {
    cvUsed: cvData?.length || 0,
    cvLimit,
    clUsed: clData?.length || 0,
    clLimit
  };
}

export async function checkUserLimit(supabase: any, userId: string, type: 'cv' | 'cover_letter') {
  // 1. Get user limits from users table
  const { data: userData } = await supabase
    .from('users')
    .select('unlocked_cv_slots, unlocked_cl_slots')
    .eq('id', userId)
    .single();

  const cvLimit = userData?.unlocked_cv_slots ?? 1;
  const clLimit = userData?.unlocked_cl_slots ?? 1;
  const limit = type === 'cv' ? cvLimit : clLimit;

  // 2. Count current completed documents
  const { count } = await supabase
    .from('resumes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', type)
    .eq('status', 'completed');

  if ((count || 0) >= limit) {
    throw new Error(`Bạn đã đạt giới hạn lưu trữ tối đa ${limit} tài liệu ${type.toUpperCase()}. Vui lòng mua thêm Slot bằng Credit để tiếp tục.`);
  }
}

export const saveDocument = withAuditLog('SAVE_DOCUMENT', async (
  data: CVSchema | CoverLetterSchema,
  type: 'cv' | 'cover_letter',
  name: string,
  profileId?: string,
  jobId?: string,
  templateId?: string,
  status: string = 'completed',
  idToUpdate?: string
) => {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  let actualProfileId = profileId;
  if (!actualProfileId) {
    const { data: profiles } = await supabase
      .from('master_profiles')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
    
    if (profiles && profiles.length > 0) {
      actualProfileId = profiles[0].id;
    } else {
      const { data: newProfile, error: createError } = await supabase
        .from('master_profiles')
        .insert({ user_id: user.id, content: {} })
        .select('id')
        .single();
        
      if (createError) throw createError;
      actualProfileId = newProfile.id;
    }
  }

  let resumeId = idToUpdate;

  if (resumeId) {
    // UPDATE existing resume
    const { error: updateError } = await supabase
      .from('resumes')
      .update({
        name: name,
        template_id: templateId || null,
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', resumeId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;
  } else {
    // Check limit before creating a new completed document
    if (status === 'completed') {
      await checkUserLimit(supabase, user.id, type);
    }

    // INSERT new resume.
    // CONSTRAINT: 1 User has at most 1 draft per type. If creating a new draft, delete the old one first.
    if (status === 'draft') {
      const { data: existingDrafts } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', type)
        .eq('status', 'draft');

      if (existingDrafts && existingDrafts.length > 0) {
        for (const draft of existingDrafts) {
          // Cascading delete should handle resume_versions
          await supabase.from('resume_versions').delete().eq('resume_id', draft.id);
          await supabase.from('resumes').delete().eq('id', draft.id);
        }
      }
    }

    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        profile_id: actualProfileId,
        job_id: jobId || null,
        type: type,
        name: name,
        template_id: templateId || null,
        status: status,
        metadata: { template_version: '1.0' }
      })
      .select('id')
      .single();

    if (resumeError) throw resumeError;
    resumeId = resume.id;
  }

  // Extract match analysis if present
  let matchAnalysis = null;
  let score = null;
  if (type === 'cv' && (data as any).matchAnalysis) {
    matchAnalysis = (data as any).matchAnalysis;
    score = matchAnalysis.matchScore || null;
  }

  // Insert new version into resume_versions
  const { error: versionError } = await supabase
    .from('resume_versions')
    .insert({
      resume_id: resumeId,
      content: data as any,
      score: score,
      match_analysis: matchAnalysis
    });

  if (versionError) throw versionError;

  return resumeId;
});

export async function getResumeById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('resumes')
    .select('*, resume_versions(content, score, match_analysis)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;

  // Get the latest version
  const latestVersion = data.resume_versions?.length 
    ? data.resume_versions[data.resume_versions.length - 1] 
    : null;

  return {
    ...data,
    content: latestVersion?.content,
    score: latestVersion?.score,
    match_analysis: latestVersion?.match_analysis
  };
}

export async function getDocuments(): Promise<SavedDocument[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Status completed OR (status draft AND updated_at >= 24 hours ago)
  const { data, error } = await supabase
    .from('resumes')
    .select('*, resume_versions(score, match_analysis)')
    .eq('user_id', user.id)
    .or(`status.eq.completed,and(status.eq.draft,updated_at.gte.${yesterday})`)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  
  return data || [];
}

export async function renameDocument(id: string, newName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('resumes')
    .update({ name: newName, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  await supabase
    .from('resume_versions')
    .delete()
    .eq('resume_id', id);

  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
}

export async function duplicateDocument(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: resume, error: fetchError } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !resume) throw new Error('Cannot fetch document');

  const { data: versions, error: vError } = await supabase
    .from('resume_versions')
    .select('content, score, match_analysis')
    .eq('resume_id', id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (vError || !versions || versions.length === 0) throw new Error('Cannot fetch content');

  if (resume.status === 'completed') {
    await checkUserLimit(supabase, user.id, resume.type);
  }

  const { data: newResume, error: insertError } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      profile_id: resume.profile_id,
      job_id: resume.job_id,
      type: resume.type,
      name: `${resume.name} (Copy)`,
      status: resume.status,
      template_id: resume.template_id,
      metadata: resume.metadata
    })
    .select('id')
    .single();

  if (insertError) throw insertError;

  const { error: versionError } = await supabase
    .from('resume_versions')
    .insert({
      resume_id: newResume.id,
      content: versions[0].content,
      score: versions[0].score,
      match_analysis: versions[0].match_analysis
    });

  if (versionError) throw versionError;

  return newResume.id;
}
