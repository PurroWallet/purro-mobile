/**
 * Circuit Breaker Implementation
 * Prevents cascading failures by stopping requests after repeated failures
 */

import { CIRCUIT_BREAKER_CONFIG } from '../endpoints';
import { ApiError, ErrorType } from '../errors';

/**
 * Circuit breaker state
 */
enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Blocking requests
}

/**
 * Circuit breaker for API requests
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private serviceUnavailableCount: number = 0;
  private resetTimeout: NodeJS.Timeout | null = null;

  private readonly failureThreshold: number;
  private readonly serviceUnavailableThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly serviceUnavailableTimeoutMs: number;

  constructor(
    failureThreshold: number = CIRCUIT_BREAKER_CONFIG.FAILURE_THRESHOLD,
    serviceUnavailableThreshold: number = CIRCUIT_BREAKER_CONFIG.SERVICE_UNAVAILABLE_THRESHOLD,
    resetTimeoutMs: number = CIRCUIT_BREAKER_CONFIG.RESET_TIMEOUT,
    serviceUnavailableTimeoutMs: number = CIRCUIT_BREAKER_CONFIG.SERVICE_UNAVAILABLE_TIMEOUT,
  ) {
    this.failureThreshold = failureThreshold;
    this.serviceUnavailableThreshold = serviceUnavailableThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.serviceUnavailableTimeoutMs = serviceUnavailableTimeoutMs;
  }

  /**
   * Check if circuit breaker allows request
   */
  canRequest(): boolean {
    return this.state === CircuitState.CLOSED;
  }

  /**
   * Record a successful request
   */
  recordSuccess(): void {
    this.failureCount = 0;
    this.serviceUnavailableCount = 0;
    this.state = CircuitState.CLOSED;
    this.clearResetTimeout();
  }

  /**
   * Record a failed request
   */
  recordFailure(error: ApiError): void {
    // Check if it's a 503 error
    if (error.statusCode === 503) {
      this.serviceUnavailableCount++;

      if (this.serviceUnavailableCount >= this.serviceUnavailableThreshold) {
        this.openCircuit(this.serviceUnavailableTimeoutMs);
      }
    } else {
      this.failureCount++;

      if (this.failureCount >= this.failureThreshold) {
        this.openCircuit(this.resetTimeoutMs);
      }
    }
  }

  /**
   * Open the circuit breaker
   */
  private openCircuit(timeoutMs: number): void {
    this.state = CircuitState.OPEN;
    this.scheduleReset(timeoutMs);
  }

  /**
   * Schedule circuit reset
   */
  private scheduleReset(timeoutMs: number): void {
    this.clearResetTimeout();

    this.resetTimeout = setTimeout(() => {
      this.reset();
    }, timeoutMs);
  }

  /**
   * Clear reset timeout
   */
  private clearResetTimeout(): void {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.serviceUnavailableCount = 0;
    this.clearResetTimeout();
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get failure counts
   */
  getStats(): {
    state: CircuitState;
    failureCount: number;
    serviceUnavailableCount: number;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      serviceUnavailableCount: this.serviceUnavailableCount,
    };
  }
}

/**
 * Execute a function with circuit breaker protection
 */
export async function executeWithCircuitBreaker<T>(
  circuitBreaker: CircuitBreaker,
  fn: () => Promise<T>,
): Promise<T> {
  // Check if circuit breaker allows request
  if (!circuitBreaker.canRequest()) {
    throw new ApiError(
      ErrorType.CIRCUIT_BREAKER_OPEN,
      'Service is temporarily unavailable due to repeated failures',
    );
  }

  try {
    const result = await fn();
    circuitBreaker.recordSuccess();
    return result;
  } catch (error) {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError(
            ErrorType.UNKNOWN_ERROR,
            error instanceof Error ? error.message : 'Unknown error',
          );

    circuitBreaker.recordFailure(apiError);
    throw apiError;
  }
}
