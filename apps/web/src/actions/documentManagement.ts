'use server';

import { createClient } from '@/utils/supabase/server';
import { ErrorCodes } from '@/lib/constants/errors';
import { CVSchema, CoverLetterSchema } from '@cv-generator/schema';
import { withAuditLog } from '@/utils/auditLogger';

export interface SavedDocument {
  id: string;
  user_id: string;
  profile_id: string | null;
  job_id: string | null;
  document_type: 'cv' | 'cover_letter';
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

  if (authError || !user) throw new Error(ErrorCodes.UNAUTHORIZED);

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
    .eq('is_default', true)
    .single();

  if (error || !data || !data.content) return true;

  // Check if content has keys, e.g. personal, experience...
  return Object.keys(data.content).length === 0;
}

export async function getUserLimits() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error(ErrorCodes.UNAUTHORIZED);

  // Fetch User's Extra Slots
  const { data: userData } = await supabase
    .from('users')
    .select('extra_cv_slots, extra_cl_slots')
    .eq('id', user.id)
    .single() as { data: { extra_cv_slots: number, extra_cl_slots: number } | null };

  // Fetch active package limits
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('packages(cv_slots, cl_slots)')
    .eq('user_id', user.id)
    .eq('status', 'ACTIVE')
    .single();

  let cvLimit = 1;
  let clLimit = 1;

  if (subData && (subData as any).packages) {
    cvLimit = (subData as any).packages.cv_slots;
    clLimit = (subData as any).packages.cl_slots;
  } else {
    // Fallback to FREE package
    const { data: freePkg } = await supabase.from('packages').select('cv_slots, cl_slots').eq('code', 'FREE').single();
    cvLimit = freePkg?.cv_slots || 1;
    clLimit = freePkg?.cl_slots || 1;
  }

  cvLimit += (userData?.extra_cv_slots || 0);
  clLimit += (userData?.extra_cl_slots || 0);

  const { data: cvData } = await supabase
    .from('resumes')
    .select('id')
    .eq('user_id', user.id)
    .eq('document_type', 'cv')
    .eq('status', 'completed')
    .is('deleted_at', null);

  const { data: clData } = await supabase
    .from('resumes')
    .select('id')
    .eq('user_id', user.id)
    .eq('document_type', 'cover_letter')
    .eq('status', 'completed')
    .is('deleted_at', null);

  return {
    cvUsed: cvData?.length || 0,
    cvLimit,
    clUsed: clData?.length || 0,
    clLimit
  };
}

export async function checkUserLimit(supabase: any, userId: string, type: 'cv' | 'cover_letter') {
  // Fetch extra slots
  const { data: userData } = await supabase
    .from('users')
    .select('extra_cv_slots, extra_cl_slots')
    .eq('id', userId)
    .single() as { data: { extra_cv_slots: number, extra_cl_slots: number } | null };

  // V2: Get limits from subscriptions -> packages
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('packages(cv_slots, cl_slots)')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .single();

  let cvLimit = 1;
  let clLimit = 1;

  if (subData && (subData as any).packages) {
    cvLimit = (subData as any).packages.cv_slots;
    clLimit = (subData as any).packages.cl_slots;
  } else {
    const { data: freePkg } = await supabase.from('packages').select('cv_slots, cl_slots').eq('code', 'FREE').single();
    cvLimit = freePkg?.cv_slots || 1;
    clLimit = freePkg?.cl_slots || 1;
  }

  cvLimit += (userData?.extra_cv_slots || 0);
  clLimit += (userData?.extra_cl_slots || 0);

  const limit = type === 'cv' ? cvLimit : clLimit;

  // 2. Count current completed documents
  const { count } = await supabase
    .from('resumes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('document_type', type)
    .eq('status', 'completed')
    .is('deleted_at', null);

  if (count !== null && count >= limit) {
    throw new Error(ErrorCodes.LIMIT_REACHED);
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
    throw new Error(ErrorCodes.UNAUTHORIZED);
  }

  let actualProfileId = profileId;
  if (!actualProfileId) {
    const { data: profiles } = await supabase
      .from('master_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .limit(1);

    if (profiles && profiles.length > 0) {
      actualProfileId = profiles[0].id;
    } else {
      const { data: newProfile, error: createError } = await supabase
        .from('master_profiles')
        .insert({
          user_id: user.id,
          name: 'Default Profile',
          is_default: true,
          content: {}
        })
        .select('id')
        .single();

      if (createError) throw createError;
      actualProfileId = newProfile.id;
    }
  }

  let resumeId = idToUpdate;

  if (resumeId) {
    // Check if we are upgrading a draft to completed
    if (status === 'completed') {
      const { data: oldResume } = await supabase
        .from('resumes')
        .select('status')
        .eq('id', resumeId)
        .single();

      if (oldResume && oldResume.status === 'draft') {
        await checkUserLimit(supabase, user.id, type);
      }
    }

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
    // Allow multiple drafts. They will be filtered out by the 24h query in getDocuments.

    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        profile_id: actualProfileId,
        job_id: jobId || null,
        document_type: type,
        name: name,
        template_id: templateId || null,
        status: status
      })
      .select('id')
      .single();

    if (resumeError) throw resumeError;
    resumeId = resume.id;
  }


  // Determine version number and overwrite instead of creating new
  const { data: existingVersion } = await supabase
    .from('resume_versions')
    .select('id')
    .eq('resume_id', resumeId)
    .limit(1)
    .maybeSingle();

  // Extract match analysis if present and remove it from content
  let matchAnalysis = null;
  let score = null;
  const contentToSave = JSON.parse(JSON.stringify(data)); // Deep copy to avoid mutating original
  console.log(
    'before save',
    contentToSave.personal?.avatar
  );

  if (type === 'cv' && contentToSave.matchAnalysis) {
    matchAnalysis = contentToSave.matchAnalysis;
    score = matchAnalysis.matchScore || null;
    delete contentToSave.matchAnalysis; // Segregate data
  }

  if (existingVersion) {
    // Update existing version
    const { error: versionError } = await supabase
      .from('resume_versions')
      .update({
        content: contentToSave,
        score: score,
        match_analysis: matchAnalysis
      })
      .eq('id', existingVersion.id);
    console.log('versionError', versionError);

    if (versionError) throw versionError;
    const { data: check } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('id', existingVersion.id)
      .single();

    console.log(
      'from db',
      JSON.stringify(check, null, 2)
    );
  } else {
    // Insert new version
    const { error: versionError } = await supabase
      .from('resume_versions')
      .insert({
        resume_id: resumeId,
        version_number: 1,
        content: contentToSave,
        score: score,
        match_analysis: matchAnalysis
      });
    if (versionError) throw versionError;
  }


  return resumeId;
});

export async function getResumeById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error(ErrorCodes.UNAUTHORIZED);

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

  if (!user) throw new Error(ErrorCodes.UNAUTHORIZED);

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Status completed OR (status draft AND updated_at >= 24 hours ago)
  const { data, error } = await supabase
    .from('resumes')
    .select('*, resume_versions(score, match_analysis)')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .or(`status.eq.completed,and(status.eq.draft,updated_at.gte.${yesterday})`)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []) as SavedDocument[];
}

export async function getResumeVersions(resumeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error(ErrorCodes.UNAUTHORIZED);

  const { data, error } = await supabase
    .from('resume_versions')
    .select('id, version_number, score, match_analysis, created_at, content')
    .eq('resume_id', resumeId)
    .order('version_number', { ascending: false });

  if (error) throw error;

  return data;
}

export async function renameDocument(id: string, newName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error(ErrorCodes.UNAUTHORIZED);

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
  if (!user) throw new Error(ErrorCodes.UNAUTHORIZED);
  // Use soft delete by setting deleted_at
  const { error } = await supabase
    .from('resumes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
}

export async function duplicateDocument(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error(ErrorCodes.UNAUTHORIZED);

  const { data: resume, error: fetchError } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !resume) throw new Error(ErrorCodes.CANNOT_FETCH_DOCUMENT);

  const { data: versions, error: vError } = await supabase
    .from('resume_versions')
    .select('content, score, match_analysis')
    .eq('resume_id', id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (vError || !versions || versions.length === 0) throw new Error(ErrorCodes.CANNOT_FETCH_DOCUMENT);

  if (resume.status === 'completed') {
    await checkUserLimit(supabase, user.id, resume.document_type as any);
  }

  const { data: newResume, error: insertError } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      profile_id: resume.profile_id,
      job_id: resume.job_id,
      document_type: resume.document_type,
      name: `${resume.name} (Copy)`,
      status: resume.status,
      template_id: resume.template_id
    })
    .select('id')
    .single();

  if (insertError) throw insertError;

  const { error: versionError } = await supabase
    .from('resume_versions')
    .insert({
      resume_id: newResume.id,
      version_number: 1,
      content: versions[0].content,
      score: versions[0].score,
      match_analysis: versions[0].match_analysis
    });

  if (versionError) throw versionError;

  return newResume.id;
}
