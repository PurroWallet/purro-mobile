/**
 * API Error Types and Utilities
 * Centralized error handling for all API services
 */

/**
 * Error type enumeration
 */
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * API Error class
 */
export class ApiError extends Error {
  type: ErrorType;
  statusCode?: number;
  originalError?: Error;
  retryable: boolean;

  constructor(
    type: ErrorType,
    message: string,
    statusCode?: number,
    originalError?: Error,
    retryable: boolean = false,
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.retryable = retryable;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Create an API error from an axios error or generic error
 */
export function createApiError(error: any): ApiError {
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || data?.error || 'API request failed';

    // Determine error type based on status code
    if (status === 429) {
      return new ApiError(
        ErrorType.RATE_LIMIT_ERROR,
        'Rate limit exceeded. Please try again later.',
        status,
        error,
        true,
      );
    }

    if (status === 503) {
      return new ApiError(
        ErrorType.SERVICE_UNAVAILABLE,
        'Service temporarily unavailable. Please try again later.',
        status,
        error,
        true,
      );
    }

    if (status >= 500) {
      return new ApiError(
        ErrorType.API_ERROR,
        'Server error occurred. Please try again.',
        status,
        error,
        true,
      );
    }

    if (status >= 400) {
      return new ApiError(ErrorType.API_ERROR, message, status, error, false);
    }

    return new ApiError(ErrorType.API_ERROR, message, status, error, false);
  }

  // Handle network errors
  if (error.request) {
    return new ApiError(
      ErrorType.NETWORK_ERROR,
      'Network error. Please check your connection.',
      undefined,
      error,
      true,
    );
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return new ApiError(
      ErrorType.TIMEOUT_ERROR,
      'Request timed out. Please try again.',
      undefined,
      error,
      true,
    );
  }

  // Handle validation errors
  if (error.message?.includes('validation') || error.message?.includes('invalid')) {
    return new ApiError(ErrorType.VALIDATION_ERROR, error.message, undefined, error, false);
  }

  // Unknown error
  return new ApiError(
    ErrorType.UNKNOWN_ERROR,
    error.message || 'An unknown error occurred',
    undefined,
    error,
    false,
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: ApiError): string {
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      return 'Unable to connect. Please check your internet connection.';
    case ErrorType.TIMEOUT_ERROR:
      return 'Request took too long. Please try again.';
    case ErrorType.RATE_LIMIT_ERROR:
      return 'Too many requests. Please wait a moment and try again.';
    case ErrorType.SERVICE_UNAVAILABLE:
      return 'Service is temporarily unavailable. Please try again later.';
    case ErrorType.CIRCUIT_BREAKER_OPEN:
      return 'Service is experiencing issues. Please try again in a few minutes.';
    case ErrorType.VALIDATION_ERROR:
      return error.message;
    case ErrorType.API_ERROR:
      return error.message || 'An error occurred. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  return error.retryable;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: ApiError): boolean {
  return error.type === ErrorType.RATE_LIMIT_ERROR || error.statusCode === 429;
}

/**
 * Check if error is a service unavailable error
 */
export function isServiceUnavailableError(error: ApiError): boolean {
  return error.type === ErrorType.SERVICE_UNAVAILABLE || error.statusCode === 503;
}

/**
 * Calculate retry delay with exponential backoff and jitter
 */
export function calculateRetryDelay(
  attempt: number,
  initialDelay: number = 1000,
  maxDelay: number = 32000,
  jitterMax: number = 1000,
): number {
  const exponentialDelay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * jitterMax;
  return exponentialDelay + jitter;
}

/**
 * Sleep utility for retry delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Classify error type from any error object
 */
export function classifyError(error: any): ErrorType {
  if (error instanceof ApiError) {
    return error.type;
  }

  if (error.response) {
    const status = error.response.status;
    if (status === 429) return ErrorType.RATE_LIMIT_ERROR;
    if (status === 503) return ErrorType.SERVICE_UNAVAILABLE;
    if (status >= 500) return ErrorType.API_ERROR;
    if (status >= 400) return ErrorType.VALIDATION_ERROR;
    return ErrorType.API_ERROR;
  }

  // Check for network errors
  if (error.request) {
    return ErrorType.NETWORK_ERROR;
  }

  // Check for timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ErrorType.TIMEOUT_ERROR;
  }

  // Check for validation errors
  if (error.message?.includes('validation') || error.message?.includes('invalid')) {
    return ErrorType.VALIDATION_ERROR;
  }

  return ErrorType.UNKNOWN_ERROR;
}

/**
 * Map error to user-friendly message with context
 */
export function mapErrorToUserMessage(error: any, context?: string): string {
  const apiError = error instanceof ApiError ? error : createApiError(error);
  const baseMessage = getUserFriendlyErrorMessage(apiError);

  if (context) {
    return `${context}: ${baseMessage}`;
  }

  return baseMessage;
}

/**
 * Log error with structured information
 */
export function logError(error: any, context?: string, metadata?: Record<string, any>): void {
  const apiError = error instanceof ApiError ? error : createApiError(error);

  const errorLog = {
    timestamp: new Date().toISOString(),
    type: apiError.type,
    message: apiError.message,
    statusCode: apiError.statusCode,
    context,
    metadata,
    stack: apiError.stack,
  };

  // Log to console in development
  if (__DEV__) {
    console.error('[Error Log]', errorLog);
  }

  // In production, you could send to error tracking service
  // Example: Sentry.captureException(apiError, { extra: errorLog });
}

/**
 * Check if error should trigger retry
 */
export function shouldRetry(error: any, attemptCount: number, maxAttempts: number = 3): boolean {
  if (attemptCount >= maxAttempts) {
    return false;
  }

  const apiError = error instanceof ApiError ? error : createApiError(error);
  return apiError.retryable;
}

/**
 * Get retry delay based on error type and attempt count
 */
export function getRetryDelay(error: any, attemptCount: number): number {
  const apiError = error instanceof ApiError ? error : createApiError(error);

  // Longer delay for rate limit errors
  if (apiError.type === ErrorType.RATE_LIMIT_ERROR) {
    return calculateRetryDelay(attemptCount, 5000, 60000, 2000);
  }

  // Longer delay for service unavailable
  if (apiError.type === ErrorType.SERVICE_UNAVAILABLE) {
    return calculateRetryDelay(attemptCount, 3000, 30000, 1000);
  }

  // Standard delay for other retryable errors
  return calculateRetryDelay(attemptCount, 1000, 10000, 500);
}
