import { NextResponse } from 'next/server';
import { AIParser } from '@cv-generator/ai';
import { getCachedSystemSettings } from '@/actions/settings';
import { withErrorHandler } from '@/lib/errors/withErrorHandler';
import { ApiError, ValidationError, AuthError } from '@/lib/errors/AppError';
import { ErrorCodes } from '@/lib/errors/errorCodes';
import { createClient } from '@/utils/supabase/server';
import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { saveDocument } from '@/actions/documentManagement';

export const POST = withErrorHandler(async (req: Request) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new AuthError('Not authenticated', ErrorCodes.UNAUTHORIZED);
  }
  
  const userId = user.id;

  // Use formData instead of json to support file uploads
  const formData = await req.formData();
  
  const jobDescription = formData.get('jobDescription') as string;
  const targetLanguage = (formData.get('targetLanguage') as string) || 'Vietnamese';
  const sourceType = (formData.get('sourceType') as string) || 'master_profile';
  const goal = (formData.get('goal') as string) || 'both';
  const toneOfVoice = formData.get('toneOfVoice') as string | undefined;

  // New fields for atomic save
  const profileId = formData.get('profileId') as string | undefined;
  const savedJobId = formData.get('savedJobId') as string | undefined;
  const cvTemplate = formData.get('cvTemplate') as string | undefined;
  const clTemplate = formData.get('clTemplate') as string | undefined;
  const existingCvId = formData.get('cvId') as string | undefined;
  const existingClId = formData.get('clId') as string | undefined;

  if (!jobDescription || typeof jobDescription !== 'string') {
    throw new ValidationError('jobDescription is required');
  }

  // --- DEV CACHING LOGIC ---
  const isDev = process.env.NODE_ENV === 'development';
  let cacheFile = '';
  let isCached = false;
  let cachedData: any = null;
  
  if (isDev) {
    const cacheDir = path.join(process.cwd(), '.cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    // We can include tone or source type in cache name, but for simple dev cache let's keep it user-based
    cacheFile = path.join(cacheDir, `ai-cv-output-${userId}.json`);
    
    // In a real scenario you might want to skip cache if testing different tones, 
    // but for now we'll return cache if it exists to save API cost. 
    // To generate a new one, user can just delete the cache file.
    if (fs.existsSync(cacheFile)) {
      console.log(`[DEV CACHE] Using cached CV output for user ${userId} to save API calls, but will still save to DB`);
      const cachedDataStr = fs.readFileSync(cacheFile, 'utf8');
      cachedData = JSON.parse(cachedDataStr);
      if (goal === 'cv') delete cachedData.coverLetter;
      if (goal === 'cover_letter') delete cachedData.cv;
      isCached = true;
    }
  }

  let masterProfile: object | undefined;
  let rawCV: string | undefined;

  if (sourceType === 'master_profile') {
    const { data: profileRecord, error: profileError } = await supabase
      .from('master_profiles')
      .select('content')
      .eq('user_id', userId)
      .single();

    if (profileError || !profileRecord || !profileRecord.content) {
      throw new ValidationError('Master Profile not found. Please create one first in the Profile section.');
    }
    masterProfile = profileRecord.content;
  } else if (sourceType === 'upload') {
    const file = formData.get('file') as File | null;
    if (!file) {
      throw new ValidationError('No PDF file provided for upload source type.');
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    rawCV = pdfData.text;
    await parser.destroy();
  } else {
    throw new ValidationError('Invalid sourceType');
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError('GEMINI_API_KEY is not configured in .env.local', 500, ErrorCodes.INTERNAL_SERVER_ERROR);
  }

  // --- CHECK CREDITS ---
  let totalCost = 0;
  const settingsMap = await getCachedSystemSettings();
  const getPrice = (k: string) => {
    return settingsMap[k] ? Number(settingsMap[k]) : 0;
  };

  if (goal === 'cv') totalCost = getPrice('price_generate_cv');
  else if (goal === 'cover_letter') totalCost = getPrice('price_generate_cl');
  else totalCost = getPrice('price_generate_cv') + getPrice('price_generate_cl');

  let { data: userData, error: userError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  if (userError && userError.code === 'PGRST116') {
    // Row not found, create user with default credits
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({ id: userId, email: user.email, credits: 10 })
      .select('credits')
      .single();
    
    if (insertError) {
      console.error('[generate-cv] Insert new user error:', insertError);
      throw new ApiError('Không thể khởi tạo thông tin tài khoản: ' + insertError.message, 500, ErrorCodes.INTERNAL_SERVER_ERROR);
    }
    userData = newUser;
    userError = null;
  } else if (userError || !userData) {
    console.error('[generate-cv] Fetch user error:', userError);
    throw new ApiError('Không thể lấy thông tin credits của người dùng. ' + (userError?.message || ''), 500, ErrorCodes.INTERNAL_SERVER_ERROR);
  }

  if (userData.credits < totalCost) {
    throw new ApiError(`Không đủ credits. Yêu cầu: ${totalCost}, Hiện có: ${userData.credits}`, 402, ErrorCodes.INSUFFICIENT_CREDITS);
  }

  const aiParser = new AIParser(process.env.GEMINI_API_KEY);
  let responseData: any = {};
  
  const startTime = Date.now();
  let totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  
  if (isCached) {
    responseData = cachedData;
  } else {
    if (goal === 'cv' || goal === 'both') {
      console.log(`[AI] Generating Tailored CV for user ${userId} (Source: ${sourceType}, Tone: ${toneOfVoice})...`);
      const cvResult = await aiParser.parseAndTailorCV(jobDescription, rawCV, targetLanguage, masterProfile, toneOfVoice);
      responseData.cv = cvResult.data;
      totalUsage.promptTokens += cvResult.usage.promptTokens;
      totalUsage.completionTokens += cvResult.usage.completionTokens;
    }
    
    if (goal === 'cover_letter' || goal === 'both') {
      console.log(`[AI] Generating Cover Letter for user ${userId}...`);
      const clContext = masterProfile ? `[Master Profile JSON]\n${JSON.stringify(masterProfile, null, 2)}` : (rawCV || '');
      const clResult = await aiParser.parseAndTailorCoverLetter(jobDescription, clContext, targetLanguage);
      responseData.coverLetter = clResult.data;
      totalUsage.promptTokens += clResult.usage.promptTokens;
      totalUsage.completionTokens += clResult.usage.completionTokens;
    }
  }

  const latency = Date.now() - startTime;

  // --- ATOMIC SAVE TO DB ---
  let finalCvId = existingCvId;
  let finalClId = existingClId;
  
  if (responseData.cv) {
    const cvName = responseData.cv.personal?.fullName ? `CV - ${responseData.cv.personal.fullName}` : 'Untitled CV';
    finalCvId = await saveDocument(responseData.cv, 'cv', cvName, profileId, savedJobId, cvTemplate, 'draft', existingCvId);
    responseData.cvId = finalCvId;
  }
  
  if (responseData.coverLetter) {
    const clName = responseData.coverLetter.personal?.fullName ? `Cover Letter - ${responseData.coverLetter.personal.fullName}` : 'Untitled Cover Letter';
    finalClId = await saveDocument(responseData.coverLetter, 'cover_letter', clName, profileId, savedJobId, clTemplate, 'draft', existingClId);
    responseData.clId = finalClId;
  }

  // --- ATOMIC LOG & DEDUCT CREDITS VIA RPC ---
  const { error: rpcError } = await supabase.rpc('log_ai_and_deduct_credits', {
    p_user_id: userId,
    p_cost: totalCost,
    p_action_type: `generate_${goal}`,
    p_model_used: process.env.GEMINI_MODEL || 'gemini-flash-latest',
    p_prompt_tokens: totalUsage.promptTokens,
    p_completion_tokens: totalUsage.completionTokens,
    p_latency_ms: latency
  });

  if (rpcError) {
    console.error('Failed to execute atomic log and deduct credits:', rpcError);
  }

  // Save cache in dev only if it was a real generation
  if (isDev && !isCached) {
    fs.writeFileSync(cacheFile, JSON.stringify(responseData, null, 2), 'utf8');
    console.log(`[DEV CACHE] Saved CV output cache for user ${userId}`);
  }

  return NextResponse.json(responseData);
});
