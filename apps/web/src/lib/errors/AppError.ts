import { ErrorCode, ErrorCodes } from './errorCodes';

export class AppError extends Error {
  public statusCode: number;
  public messageCode: ErrorCode;

  constructor(message: string, statusCode: number, messageCode: ErrorCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.messageCode = messageCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ApiError extends AppError {
  constructor(message: string, statusCode: number = 500, messageCode: ErrorCode = ErrorCodes.INTERNAL_SERVER_ERROR) {
    super(message, statusCode, messageCode);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, messageCode: ErrorCode = ErrorCodes.BAD_REQUEST) {
    super(message, 400, messageCode);
  }
}

export class AuthError extends AppError {
  constructor(message: string, messageCode: ErrorCode = ErrorCodes.UNAUTHORIZED) {
    super(message, 401, messageCode);
  }
}
