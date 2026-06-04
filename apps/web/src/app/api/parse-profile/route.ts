import { NextResponse } from 'next/server';
import { AIParser } from '@cv-generator/ai';
import { getCachedSystemSettings } from '@/actions/settings';
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
  let isCached = false;
  let cachedData: any = null;
  
  if (isDev) {
    const cacheDir = path.join(process.cwd(), '.cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    cacheFile = path.join(cacheDir, `ai-master-profile-${userId}.json`);
    
    if (fs.existsSync(cacheFile)) {
      console.log(`[DEV CACHE] Using cached Master Profile for user ${userId} to save API calls, but will still save to DB`);
      const cachedDataStr = fs.readFileSync(cacheFile, 'utf8');
      cachedData = JSON.parse(cachedDataStr);
      isCached = true;
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError('GEMINI_API_KEY is not configured in .env.local', 500, ErrorCodes.INTERNAL_SERVER_ERROR);
  }

  // --- CHECK CREDITS ---
  const settingsMap = await getCachedSystemSettings();
  const totalCost = settingsMap.price_parse_profile ? Number(settingsMap.price_parse_profile) : 0;

  let { data: userData, error: userError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  if (userError && userError.code === 'PGRST116') {
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({ id: userId, email: user.email, credits: 10 })
      .select('credits')
      .single();
    
    if (insertError) {
      console.error('[parse-profile] Insert new user error:', insertError);
      throw new ApiError('Không thể khởi tạo thông tin tài khoản: ' + insertError.message, 500, ErrorCodes.INTERNAL_SERVER_ERROR);
    }
    userData = newUser;
    userError = null;
  } else if (userError || !userData) {
    console.error('[parse-profile] Fetch user error:', userError);
    throw new ApiError('Không thể lấy thông tin credits của người dùng. ' + (userError?.message || ''), 500, ErrorCodes.INTERNAL_SERVER_ERROR);
  }

  if (userData.credits < totalCost) {
    throw new ApiError(`Không đủ credits. Yêu cầu: ${totalCost}, Hiện có: ${userData.credits}`, 402, ErrorCodes.INSUFFICIENT_CREDITS);
  }

  const aiParser = new AIParser(process.env.GEMINI_API_KEY);
  
  console.log(`[AI] Parsing Master Profile for user ${userId}...`);
  const startTime = Date.now();
  let parsedData: any = null;
  let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  
  if (isCached) {
    parsedData = cachedData;
  } else {
    const parsedResult = await aiParser.parseMasterProfile(contentToParse);
    parsedData = parsedResult.data;
    usage = parsedResult.usage;
  }
  const latency = Date.now() - startTime;

  // --- ATOMIC SAVE TO DB ---
  // Overwrite the existing master_profile
  const { error: upsertError } = await supabase
    .from('master_profiles')
    .upsert({ user_id: userId, content: parsedData }, { onConflict: 'user_id' });
    
  if (upsertError) {
    throw new ApiError('Không thể lưu thông tin vào CSDL sau khi phân tích.', 500, ErrorCodes.INTERNAL_SERVER_ERROR);
  }

  // --- ATOMIC LOG & DEDUCT CREDITS VIA RPC ---
  const { error: rpcError } = await supabase.rpc('log_ai_and_deduct_credits', {
    p_user_id: userId,
    p_cost: totalCost,
    p_action_type: 'parse_master_profile',
    p_model_used: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    p_prompt_tokens: usage.promptTokens,
    p_completion_tokens: usage.completionTokens,
    p_latency_ms: latency
  });

  if (rpcError) {
    console.error('Failed to execute atomic log and deduct credits:', rpcError);
  }

  // Save cache in dev only if it was a real generation
  if (isDev && !isCached) {
    fs.writeFileSync(cacheFile, JSON.stringify(parsedData, null, 2), 'utf8');
    console.log(`[DEV CACHE] Saved Master Profile cache for user ${userId}`);
  }

  return NextResponse.json(parsedData);
});
