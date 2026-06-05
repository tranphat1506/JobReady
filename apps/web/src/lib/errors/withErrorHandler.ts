import { NextResponse } from 'next/server';
import { AppError } from './AppError';
import { ErrorCodes, ErrorCode } from '../constants/errors';

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
      
      return NextResponse.json(
        {
          error: errorMessage,
          errorCode: 500,
          messageCode: ErrorCodes.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  };
}
