/**
 * React Query Configuration
 * Centralized QueryClient setup with optimized defaults for NFT data fetching
 */

import { QueryClient } from '@tanstack/react-query';
import { ApiError, ErrorType } from '@/core/apis/errors';

/**
 * Custom retry logic that checks error status codes
 * - Skip retry for 4xx client errors (validation, not found, etc.)
 * - Retry network errors and 5xx server errors up to 3 times
 * - Skip retry for rate limit errors (handled separately)
 */
function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  // Max 3 retry attempts
  if (failureCount >= 3) {
    return false;
  }

  // Handle ApiError instances
  if (error instanceof ApiError) {
    // Don't retry client errors (4xx)
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      return false;
    }

    // Don't retry rate limit errors immediately
    if (error.type === ErrorType.RATE_LIMIT_ERROR) {
      return false;
    }

    // Don't retry validation errors
    if (error.type === ErrorType.VALIDATION_ERROR) {
      return false;
    }

    // Retry network errors, timeouts, and 5xx errors
    if (
      error.type === ErrorType.NETWORK_ERROR ||
      error.type === ErrorType.TIMEOUT_ERROR ||
      error.type === ErrorType.SERVICE_UNAVAILABLE ||
      (error.statusCode && error.statusCode >= 500)
    ) {
      return true;
    }

    // Use the retryable flag from ApiError
    return error.retryable;
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    // Don't retry 4xx errors
    if (err.response?.status >= 400 && err.response?.status < 500) {
      return false;
    }

    // Retry 5xx errors and network errors
    if (err.response?.status >= 500 || err.request) {
      return true;
    }
  }

  // Don't retry unknown errors
  return false;
}

/**
 * Calculate retry delay with exponential backoff
 * Starts at 1 second, doubles each attempt, caps at 30 seconds
 */
function retryDelay(attemptIndex: number): number {
  return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
}

/**
 * QueryClient instance with optimized configuration for NFT data
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Garbage collection time: Remove inactive queries after 30 minutes
      gcTime: 30 * 60 * 1000,

      // Stale time: Consider data fresh for 5 minutes
      staleTime: 5 * 60 * 1000,

      // Custom retry logic
      retry: shouldRetryQuery,

      // Exponential backoff for retries
      retryDelay,

      // Don't refetch on window focus (not applicable on mobile)
      refetchOnWindowFocus: false,

      // Refetch on reconnect to get fresh data after network recovery
      refetchOnReconnect: true,

      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once for network errors
      retry: 1,
      retryDelay,
    },
  },
});
