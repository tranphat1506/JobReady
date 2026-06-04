import { NextResponse } from 'next/server';
import { AppError } from './AppError';
import { ErrorCodes, ErrorCode } from './errorCodes';
import { createClient } from '@/utils/supabase/server';
import { logUserActivity } from '@/utils/auditLogger';

export function withErrorHandler(handler: (req: Request, ...args: any[]) => Promise<NextResponse>) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      console.error('API Error:', error);
      // Attempt to log the error to activity_logs and optionally ai_generation_logs
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const url = new URL(req.url);
          const path = url.pathname;
          
          // 1. Always log to activity_logs
          await logUserActivity({
            userId: user.id,
            action: 'API_ERROR',
            newState: { 
              path,
              error_message: error?.message || 'Unknown error'
            }
          });

          // 2. If it's an AI endpoint, also log to ai_generation_logs
          if (path.includes('/api/generate-cv') || path.includes('/api/parse-profile')) {
            let actionType = 'api_error';
            if (path.includes('generate-cv')) actionType = 'generate_cv_api_error';
            if (path.includes('parse-profile')) actionType = 'parse_master_profile_api_error';

            const adminSupabase = require('@supabase/supabase-js').createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            
            await adminSupabase.from('ai_generation_logs').insert({
              user_id: user.id,
              action_type: actionType,
              status: 'failed',
              error_message: error?.message || 'Unknown error',
              credits_used: 0,
              tokens_prompt: 0,
              tokens_completion: 0,
              latency_ms: 0,
              model_used: 'unknown'
            });
          }
        }
      } catch (logErr) {
        console.error('Failed to log API error', logErr);
      }

      // Handle expected application errors
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            error: error.message,
            errorCode: error.statusCode,
            messageCode: error.messageCode,
            timestamp: new Date().toISOString(),
          },
          { status: error.statusCode }
        );
      }

      // Handle unexpected errors (fallback)
      const errorMessage = error.message || 'Internal Server Error';
      
      // Temporary Gemini parsing logic fallback for unhandled 3rd party errors
      let errorCode = 500;
      let messageCode: ErrorCode = ErrorCodes.INTERNAL_SERVER_ERROR;

      if (errorMessage.includes('503') || errorMessage.includes('high demand')) {
        errorCode = 503;
        messageCode = ErrorCodes.API_GEMINI_SERVICE_UNAVAILABLE;
      } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        errorCode = 429;
        messageCode = ErrorCodes.API_GEMINI_RATE_LIMIT;
      } else if (errorMessage.includes('401') || errorMessage.includes('API key')) {
        errorCode = 401;
        messageCode = ErrorCodes.API_GEMINI_UNAUTHORIZED;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          errorCode,
          messageCode,
          timestamp: new Date().toISOString(),
        },
        { status: errorCode }
      );
    }
  };
}
