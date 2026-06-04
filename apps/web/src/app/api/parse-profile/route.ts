import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { withErrorHandler } from '@/lib/errors/withErrorHandler';
import { ApiError, ValidationError, AuthError } from '@/lib/errors/AppError';
import { ErrorCodes } from '@/lib/errors/errorCodes';
import { createClient } from '@/utils/supabase/server';
import { inngest } from '@/inngest/client';

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

  // --- DISPATCH INNGEST EVENT ---
  await inngest.send({
    name: 'profile/parse',
    data: {
      userId,
      contentToParse
    },
  });

  return NextResponse.json(
    { message: 'Đang xử lý nền. Vui lòng đợi...' },
    { status: 202 } // 202 Accepted means request received but processing asynchronously
  );
});
