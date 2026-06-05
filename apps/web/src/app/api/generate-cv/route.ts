import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/errors/withErrorHandler';
import { ApiError, ValidationError, AuthError } from '@/lib/errors/AppError';
import { ErrorCodes } from '@/lib/constants/errors';
import { createClient } from '@/utils/supabase/server';
import { AI_PRICING } from '@/constants/pricing';
import { PDFParse } from 'pdf-parse';
import { inngest } from '@/inngest/client';

export const POST = withErrorHandler(async (req: Request) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new AuthError('Not authenticated', ErrorCodes.UNAUTHORIZED);
  }
  
  const userId = user.id;

  try {
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
      throw new ValidationError('jobDescription is required', ErrorCodes.MISSING_JOB_DESCRIPTION);
    }

    let masterProfile: object | undefined;
    let rawCV: string | undefined;

    if (sourceType === 'master_profile') {
      let masterProfileData: object | undefined;
      if (profileId) {
        const { data: profileRecord, error: profileError } = await supabase
          .from('master_profiles')
          .select('content')
          .eq('id', profileId)
          .single();
        if (!profileError && profileRecord) {
          masterProfileData = profileRecord.content as object;
        }
      } else {
        const { data: profileRecord, error: profileError } = await supabase
          .from('master_profiles')
          .select('content')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();
        if (!profileError && profileRecord) {
          masterProfileData = profileRecord.content as object;
        }
      }
      if (!masterProfileData) {
        throw new ValidationError('Master Profile not found. Please create one first in the Profile section.', ErrorCodes.MASTER_PROFILE_NOT_FOUND);
      }
      masterProfile = masterProfileData;
    } else if (sourceType === 'upload') {
      const file = formData.get('file') as File | null;
      if (!file) {
        throw new ValidationError('No PDF file provided for upload source type.', ErrorCodes.MISSING_PDF_FILE);
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      rawCV = pdfData.text;
      await parser.destroy();
    } else {
      throw new ValidationError('Invalid sourceType', ErrorCodes.INVALID_SOURCE_TYPE);
    }

    // --- RESERVE CREDITS UPFRONT ---
    let totalCost = 0;
    if (goal === "cv") totalCost = AI_PRICING.generate_cv;
    else if (goal === "cover_letter") totalCost = AI_PRICING.generate_cl;
    else totalCost = AI_PRICING.generate_cv + AI_PRICING.generate_cl;

    // Call the atomic reservation RPC
    const { data: logId, error: reserveError } = await supabase.rpc('reserve_ai_credits', {
      p_user_id: userId,
      p_cost: totalCost,
      p_action_type: `generate_${goal}`,
      p_metadata: { goal, source_type: sourceType, target_language: targetLanguage }
    });

    if (reserveError) {
      if (reserveError.message.includes('Insufficient credits')) {
        throw new ValidationError('Bạn không đủ Credit để thực hiện chức năng này.', ErrorCodes.INSUFFICIENT_CREDITS);
      }
      throw new ApiError('Failed to reserve credits', 500, ErrorCodes.INTERNAL_SERVER_ERROR);
    }

    // --- DISPATCH INNGEST EVENT ---
    try {
      await inngest.send({
        name: 'cv/generate',
        data: {
          userId,
          jobDescription,
          targetLanguage,
          sourceType,
          goal,
          toneOfVoice,
          profileId,
          savedJobId,
          cvTemplate,
          clTemplate,
          existingCvId,
          existingClId,
          rawCV,
          masterProfile,
          logId
        },
      });
    } catch (error: any) {
      console.error("[generate-cv] API Dispatch Error:", error);
      // If dispatching to worker fails, refund the user immediately using Admin client!
      const { createClient: createSupabaseAdmin } = require("@supabase/supabase-js");
      const adminSupabase = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { auth: { persistSession: false } }
      );

      const { error: refundError } = await adminSupabase.rpc('finalize_ai_job', {
        p_log_id: logId,
        p_success: false,
        p_error_message: `${ErrorCodes.DISPATCH_FAILED}: ${error.message}`
      });
      
      if (refundError) {
        console.error("[generate-cv] Failed to process refund:", refundError);
      } else {
        console.log(`[generate-cv] Successfully processed refund for logId: ${logId}`);
      }

      throw new ApiError('Failed to dispatch background job. Credits refunded.', 500, ErrorCodes.DISPATCH_FAILED);
    }
  } catch (error) {
    // Bắt lỗi tại tầng API (như thiếu Data, hết tiền) và ghi nhận hành vi thất bại
    const { AppLogger } = require('@/lib/logger');
    const { ActivityEvent } = require('@/lib/constants/events');
    await AppLogger.trackActivity(userId, ActivityEvent.CV_GENERATED_FAILED);
    throw error; // Ném lại cho withErrorHandler xử lý HTTP Response
  }

  return NextResponse.json(
    { message: 'Đang xử lý nền. Vui lòng đợi...' },
    { status: 202 }
  );
});
