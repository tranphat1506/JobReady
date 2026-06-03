import { NextResponse } from 'next/server';
import { AIParser } from '@cv-generator/ai';
import { withErrorHandler } from '@/lib/errors/withErrorHandler';
import { ApiError, ValidationError, AuthError } from '@/lib/errors/AppError';
import { ErrorCodes } from '@/lib/errors/errorCodes';
import { createClient } from '@/utils/supabase/server';
import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import path from 'path';

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

  if (!jobDescription || typeof jobDescription !== 'string') {
    throw new ValidationError('jobDescription is required');
  }

  // --- DEV CACHING LOGIC ---
  const isDev = process.env.NODE_ENV === 'development';
  let cacheFile = '';
  
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
      console.log(`[DEV CACHE] Returning cached CV output for user ${userId}`);
      const cachedDataStr = fs.readFileSync(cacheFile, 'utf8');
      const cachedData = JSON.parse(cachedDataStr);
      if (goal === 'cv') delete cachedData.coverLetter;
      if (goal === 'cover_letter') delete cachedData.cv;
      return NextResponse.json(cachedData);
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

  const aiParser = new AIParser(process.env.GEMINI_API_KEY);
  const responseData: any = {};
  
  if (goal === 'cv' || goal === 'both') {
    console.log(`[AI] Generating Tailored CV for user ${userId} (Source: ${sourceType}, Tone: ${toneOfVoice})...`);
    responseData.cv = await aiParser.parseAndTailorCV(jobDescription, rawCV, targetLanguage, masterProfile, toneOfVoice);
  }
  
  if (goal === 'cover_letter' || goal === 'both') {
    console.log(`[AI] Generating Cover Letter for user ${userId}...`);
    const clContext = masterProfile ? `[Master Profile JSON]\n${JSON.stringify(masterProfile, null, 2)}` : (rawCV || '');
    // We could theoretically pass toneOfVoice to coverLetter too in the future.
    responseData.coverLetter = await aiParser.parseAndTailorCoverLetter(jobDescription, clContext, targetLanguage);
  }

  // Save cache in dev
  if (isDev && cacheFile) {
    fs.writeFileSync(cacheFile, JSON.stringify(responseData, null, 2), 'utf8');
    console.log(`[DEV CACHE] Saved CV output cache for user ${userId}`);
  }

  return NextResponse.json(responseData);
});
