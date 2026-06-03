import { NextResponse } from 'next/server';
import { AIParser } from '@cv-generator/ai';
import { PDFParse } from 'pdf-parse';
import { withErrorHandler } from '@/lib/errors/withErrorHandler';
import { ApiError, ValidationError, AuthError } from '@/lib/errors/AppError';
import { ErrorCodes } from '@/lib/errors/errorCodes';
import { createClient } from '@/utils/supabase/server';
import fs from 'fs';
import path from 'path';

export const POST = withErrorHandler(async (req: Request) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new AuthError('Not authenticated', ErrorCodes.UNAUTHORIZED);
  }
  
  const userId = user.id;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const text = formData.get('text') as string | null;

  let contentToParse = '';

  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    contentToParse = pdfData.text;
    await parser.destroy();
  } else if (text) {
    contentToParse = text;
  } else {
    throw new ValidationError('No file or text provided');
  }

  // --- DEV CACHING LOGIC ---
  const isDev = process.env.NODE_ENV === 'development';
  let cacheFile = '';
  
  if (isDev) {
    const cacheDir = path.join(process.cwd(), '.cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    cacheFile = path.join(cacheDir, `ai-master-profile-${userId}.json`);
    
    if (fs.existsSync(cacheFile)) {
      console.log(`[DEV CACHE] Returning cached Master Profile for user ${userId}`);
      const cachedData = fs.readFileSync(cacheFile, 'utf8');
      return NextResponse.json(JSON.parse(cachedData));
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError('GEMINI_API_KEY is not configured in .env.local', 500, ErrorCodes.INTERNAL_SERVER_ERROR);
  }

  // --- CHECK CREDITS ---
  const { data: settings } = await supabase.from('system_settings').select('value').eq('key', 'price_parse_profile').single();
  const totalCost = settings ? Number(settings.value) : 0;

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    throw new ApiError('Không thể lấy thông tin credits của người dùng', 500, ErrorCodes.INTERNAL_SERVER_ERROR);
  }

  if (userData.credits < totalCost) {
    throw new ApiError(`Không đủ credits. Yêu cầu: ${totalCost}, Hiện có: ${userData.credits}`, 402, 'INSUFFICIENT_CREDITS');
  }

  const aiParser = new AIParser(process.env.GEMINI_API_KEY);
  
  console.log(`[AI] Parsing Master Profile for user ${userId}...`);
  const startTime = Date.now();
  const parsedResult = await aiParser.parseMasterProfile(contentToParse);
  const parsedData = parsedResult.data;
  const usage = parsedResult.usage;
  const latency = Date.now() - startTime;

  // Log to Supabase silently
  supabase.from('ai_generation_logs').insert({
    user_id: userId,
    action_type: 'parse_master_profile',
    model_used: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    tokens_prompt: usage.promptTokens,
    tokens_completion: usage.completionTokens,
    cost_usd: 0,
    latency_ms: latency,
    status: 'success'
  }).then(({error}) => {
    if (error) console.error('Failed to log AI generation:', error);
  });

  // Deduct credits silently
  if (totalCost > 0) {
    supabase.from('users')
      .update({ credits: userData.credits - totalCost })
      .eq('id', userId)
      .then(({error}) => {
        if (error) console.error('Failed to deduct credits:', error);
      });
  }

  // Save cache in dev
  if (isDev && cacheFile) {
    fs.writeFileSync(cacheFile, JSON.stringify(parsedData, null, 2), 'utf8');
    console.log(`[DEV CACHE] Saved Master Profile cache for user ${userId}`);
  }

  return NextResponse.json(parsedData);
});
