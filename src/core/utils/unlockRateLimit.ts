/**
 * Unlock rate limiting utility
 * Prevents brute force attacks by limiting unlock attempts
 */

import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'unlock-rate-limit' });

const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
};

const STORAGE_KEYS = {
  FAILED_ATTEMPTS: 'failed_attempts',
  LAST_FAILED_TIME: 'last_failed_time',
  LOCKOUT_UNTIL: 'lockout_until',
};

/**
 * Check if user has failed too many times
 */
export function checkMultipleFailed(): void {
  const attempts = storage.getNumber(STORAGE_KEYS.FAILED_ATTEMPTS) || 0;
  const newAttempts = attempts + 1;

  storage.set(STORAGE_KEYS.FAILED_ATTEMPTS, newAttempts);
  storage.set(STORAGE_KEYS.LAST_FAILED_TIME, Date.now());

  if (newAttempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
    const lockoutUntil = Date.now() + RATE_LIMIT_CONFIG.LOCKOUT_DURATION;
    storage.set(STORAGE_KEYS.LOCKOUT_UNTIL, lockoutUntil);
  }
}

/**
 * Reset failed attempts counter
 */
export function resetMultipleFailed(): void {
  storage.delete(STORAGE_KEYS.FAILED_ATTEMPTS);
  storage.delete(STORAGE_KEYS.LAST_FAILED_TIME);
  storage.delete(STORAGE_KEYS.LOCKOUT_UNTIL);
}

/**
 * Check if user should be rejected due to multiple failed attempts
 */
export function shouldRejectUnlockDueToMultipleFailed(): {
  reject: boolean;
  timeDiff: number;
} {
  const lockoutUntil = storage.getNumber(STORAGE_KEYS.LOCKOUT_UNTIL);

  if (!lockoutUntil) {
    return { reject: false, timeDiff: 0 };
  }

  const now = Date.now();
  const timeDiff = lockoutUntil - now;

  if (timeDiff <= 0) {
    // Lockout period has passed, reset
    resetMultipleFailed();
    return { reject: false, timeDiff: 0 };
  }

  return { reject: true, timeDiff };
}

/**
 * Get current failed attempts count
 */
export function getFailedAttempts(): number {
  return storage.getNumber(STORAGE_KEYS.FAILED_ATTEMPTS) || 0;
}

/**
 * Get remaining time until unlock is allowed
 */
export function getRemainingLockoutTime(): number {
  const lockoutUntil = storage.getNumber(STORAGE_KEYS.LOCKOUT_UNTIL);
  if (!lockoutUntil) return 0;

  const timeDiff = lockoutUntil - Date.now();
  return Math.max(0, timeDiff);
}
