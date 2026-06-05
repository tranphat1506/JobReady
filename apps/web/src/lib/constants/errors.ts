export const HttpStatusCode = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCode = typeof HttpStatusCode[keyof typeof HttpStatusCode];

export const ErrorCodes = {
  // System Errors
  INTERNAL_SERVER_ERROR: 'error.system.internal',
  BAD_REQUEST: 'error.system.bad_request',
  INSUFFICIENT_CREDITS: 'error.system.insufficient_credits',
  DISPATCH_FAILED: 'error.system.dispatch_failed',
  WORKER_FAILED: 'error.ai.worker_failed',

  // API Errors
  API_GEMINI_SERVICE_UNAVAILABLE: 'error.api.gemini.service_unavailable',
  API_GEMINI_RATE_LIMIT: 'error.api.gemini.rate_limit_exceeded',
  API_GEMINI_UNAUTHORIZED: 'error.api.gemini.unauthorized',
  API_GEMINI_UNKNOWN: 'error.api.gemini.unknown',

  // Auth Errors
  UNAUTHORIZED: 'error.auth.unauthorized',
  FORBIDDEN: 'error.auth.forbidden',

  // Validation Errors
  MISSING_JOB_DESCRIPTION: 'error.validation.missing_job_description',
  MASTER_PROFILE_NOT_FOUND: 'error.validation.master_profile_not_found',
  MISSING_PDF_FILE: 'error.validation.missing_pdf_file',
  INVALID_SOURCE_TYPE: 'error.validation.invalid_source_type',
  NO_FILE_OR_TEXT: 'error.validation.no_file_or_text',

  // Action Errors
  LIMIT_REACHED: 'error.action.limit_reached',
  TRANSACTION_FAILED: 'error.action.transaction_failed',
  CANNOT_FETCH_DOCUMENT: 'error.action.cannot_fetch_document',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
