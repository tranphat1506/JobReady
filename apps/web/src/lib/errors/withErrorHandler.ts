import { NextResponse } from 'next/server';
import { AppError } from './AppError';
import { ErrorCodes, ErrorCode } from './errorCodes';

export function withErrorHandler(handler: (req: Request, ...args: any[]) => Promise<NextResponse>) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      console.error('API Error:', error);

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
