import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { withErrorHandler } from '@/lib/errors/withErrorHandler';
import { ApiError, ValidationError, AuthError } from '@/lib/errors/AppError';
import { ErrorCodes } from '@/lib/errors/errorCodes';
import { createClient } from '@/utils/supabase/server';
import { getCachedSystemSettings } from '@/actions/settings';
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

  // --- RESERVE CREDITS UPFRONT ---
  const settingsMap = await getCachedSystemSettings();
  const totalCost = settingsMap.price_parse_profile ? Number(settingsMap.price_parse_profile) : 0;

  const { data: logId, error: reserveError } = await supabase.rpc('reserve_ai_credits', {
    p_user_id: userId,
    p_cost: totalCost,
    p_action_type: 'parse_master_profile'
  });

  if (reserveError) {
    if (reserveError.message.includes('Insufficient credits')) {
      throw new ValidationError('Bạn không đủ Credit để thực hiện chức năng này.');
    }
    throw new ApiError('Failed to reserve credits', 500, ErrorCodes.INTERNAL_SERVER_ERROR);
  }

  // --- DISPATCH INNGEST EVENT ---
  await inngest.send({
    name: 'profile/parse',
    data: {
      userId,
      contentToParse,
      logId
    },
  });

  return NextResponse.json(
    { message: 'Đang xử lý nền. Vui lòng đợi...' },
    { status: 202 } // 202 Accepted means request received but processing asynchronously
  );
});
