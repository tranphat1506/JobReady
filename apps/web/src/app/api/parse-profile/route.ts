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

  const aiParser = new AIParser(process.env.GEMINI_API_KEY);
  
  console.log(`[AI] Parsing Master Profile for user ${userId}...`);
  const parsedData = await aiParser.parseMasterProfile(contentToParse);

  // Save cache in dev
  if (isDev && cacheFile) {
    fs.writeFileSync(cacheFile, JSON.stringify(parsedData, null, 2), 'utf8');
    console.log(`[DEV CACHE] Saved Master Profile cache for user ${userId}`);
  }

  return NextResponse.json(parsedData);
});
