/**
 * Retry Utilities
 * Provides retry mechanisms for async operations
 */

import { type ApiError, getRetryDelay, logError, shouldRetry, sleep } from '../apis/errors';

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Callback invoked before each retry */
  onRetry?: (error: ApiError, attempt: number) => void;
  /** Callback invoked when all retries are exhausted */
  onMaxRetriesReached?: (error: ApiError) => void;
  /** Context for error logging */
  context?: string;
}

/**
 * Execute an async function with automatic retry logic
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxAttempts = 3, onRetry, onMaxRetriesReached, context } = options;

  let lastError: any;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;

      // Log the error
      logError(error, context, { attempt, maxAttempts });

      // Check if we should retry
      if (!shouldRetry(error, attempt, maxAttempts)) {
        throw error;
      }

      // Notify about retry
      if (onRetry) {
        onRetry(error as ApiError, attempt);
      }

      // Calculate and wait for retry delay
      const delay = getRetryDelay(error, attempt - 1);
      await sleep(delay);
    }
  }

  // All retries exhausted
  if (onMaxRetriesReached) {
    onMaxRetriesReached(lastError);
  }

  throw lastError;
}

/**
 * Create a retry wrapper for a function
 */
export function createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {},
): T {
  return ((...args: Parameters<T>) => {
    return withRetry(() => fn(...args), options);
  }) as T;
}

/**
 * Retry with exponential backoff and jitter
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000,
): Promise<T> {
  return withRetry(fn, { maxAttempts, initialDelay });
}
