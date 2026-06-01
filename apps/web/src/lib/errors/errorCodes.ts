export const ErrorCodes = {
  // System Errors
  INTERNAL_SERVER_ERROR: 'error.system.internal',
  BAD_REQUEST: 'error.system.bad_request',

  // API Errors
  API_GEMINI_SERVICE_UNAVAILABLE: 'error.api.gemini.service_unavailable',
  API_GEMINI_RATE_LIMIT: 'error.api.gemini.rate_limit_exceeded',
  API_GEMINI_UNAUTHORIZED: 'error.api.gemini.unauthorized',
  API_GEMINI_UNKNOWN: 'error.api.gemini.unknown',

  // Auth Errors
  UNAUTHORIZED: 'error.auth.unauthorized',
  FORBIDDEN: 'error.auth.forbidden',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
