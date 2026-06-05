export enum ProviderErrorCode {
  SERVICE_UNAVAILABLE = 'error.api.gemini.service_unavailable',
  RATE_LIMIT_EXCEEDED = 'error.api.gemini.rate_limit_exceeded',
  UNAUTHORIZED = 'error.api.gemini.unauthorized',
  UNKNOWN = 'error.api.gemini.unknown',
}

export enum ProviderStatusCode {
  SERVICE_UNAVAILABLE = 503,
  RATE_LIMIT_EXCEEDED = 429,
  UNAUTHORIZED = 401,
  INTERNAL_ERROR = 500,
}

export class AIProviderError extends Error {
  public statusCode: number;
  public code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'AIProviderError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Utility function to parse raw provider errors and map them to semantic AIProviderErrors
 */
export function mapProviderError(error: any): never {
  const errorMessage = error?.message || String(error);
  
  if (errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('overloaded')) {
    throw new AIProviderError(ProviderStatusCode.SERVICE_UNAVAILABLE, ProviderErrorCode.SERVICE_UNAVAILABLE, errorMessage);
  } 
  
  if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('exhausted')) {
    throw new AIProviderError(ProviderStatusCode.RATE_LIMIT_EXCEEDED, ProviderErrorCode.RATE_LIMIT_EXCEEDED, errorMessage);
  } 
  
  if (errorMessage.includes('401') || errorMessage.includes('API key') || errorMessage.includes('unauthorized')) {
    throw new AIProviderError(ProviderStatusCode.UNAUTHORIZED, ProviderErrorCode.UNAUTHORIZED, errorMessage);
  }

  // Fallback to unknown provider error
  throw new AIProviderError(ProviderStatusCode.INTERNAL_ERROR, ProviderErrorCode.UNKNOWN, errorMessage);
}
