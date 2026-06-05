import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { withErrorHandler } from '@/lib/errors/withErrorHandler';
import { ApiError, ValidationError, AuthError } from '@/lib/errors/AppError';
import { ErrorCodes } from '@/lib/constants/errors';
import { createClient } from '@/utils/supabase/server';
import { AI_PRICING } from '@/constants/pricing';
import { inngest } from '@/inngest/client';
import { LedgerEvent } from '@/lib/constants/events';

export const POST = withErrorHandler(async (req: Request) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new AuthError('Not authenticated', ErrorCodes.UNAUTHORIZED);
  }
  
  const userId = user.id;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const isDefault = formData.get('is_default') === 'true';
    const profileName = formData.get('name') as string || 'Hồ sơ mặc định';

    if (!file) {
      throw new ValidationError('No PDF file provided', ErrorCodes.MISSING_PDF_FILE);
    }

    // 1. Read the PDF file
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const rawCV = pdfData.text;
    await parser.destroy();

    // 2. Reserve Credits Upfront
    const totalCost = AI_PRICING.parse_profile;
    const { data: logId, error: reserveError } = await supabase.rpc('reserve_ai_credits', {
      p_user_id: userId,
      p_cost: totalCost,
      p_action_type: 'parse_master_profile',
      p_metadata: { source_type: 'upload', target_language: 'auto' },
      p_message_code: LedgerEvent.PARSE_PROFILE_RESERVE
    });

    if (reserveError) {
      if (reserveError.message.includes('Insufficient credits')) {
        throw new ValidationError('Bạn không đủ Credit để thực hiện chức năng này.', ErrorCodes.INSUFFICIENT_CREDITS);
      }
      throw new ApiError('Failed to reserve credits', 500, ErrorCodes.INTERNAL_SERVER_ERROR);
    }

    // 3. Dispatch Background Job
    try {
      await inngest.send({
        name: 'profile/parse',
        data: {
          userId,
          rawCV,
          isDefault,
          profileName,
          logId
        },
      });
    } catch (error: any) {
      console.error("[parse-profile] API Dispatch Error:", error);
      
      const { createClient: createSupabaseAdmin } = require("@supabase/supabase-js");
      const adminSupabase = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { auth: { persistSession: false } }
      );

      await adminSupabase.rpc('finalize_ai_job', {
        p_log_id: logId,
        p_success: false,
        p_error_message: `${ErrorCodes.DISPATCH_FAILED}: ${error.message}`,
        p_refund_message_code: LedgerEvent.PARSE_PROFILE_REFUND
      });

      throw new ApiError('Failed to dispatch background job. Credits refunded.', 500, ErrorCodes.DISPATCH_FAILED);
    }
  } catch (error) {
    const { AppLogger } = require('@/lib/logger');
    const { ActivityEvent } = require('@/lib/constants/events');
    await AppLogger.trackActivity(userId, ActivityEvent.PROFILE_PARSED_FAILED);
    throw error;
  }

  return NextResponse.json(
    { message: 'Đang xử lý nền. Vui lòng đợi...' },
    { status: 202 } // 202 Accepted means request received but processing asynchronously
  );
});
