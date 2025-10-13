/**
 * Event constants for app-wide event broadcasting
 */

export enum BroadcastEvent {
  // Wallet events
  WALLET_CREATED = 'wallet:created',
  WALLET_IMPORTED = 'wallet:imported',
  WALLET_LOCKED = 'wallet:locked',
  WALLET_UNLOCKED = 'wallet:unlocked',
  WALLET_RESET = 'wallet:reset',

  // Account events
  ACCOUNT_CHANGED = 'account:changed',
  ACCOUNT_ADDED = 'account:added',
  ACCOUNT_REMOVED = 'account:removed',

  // Authentication events
  PASSWORD_SET = 'password:set',
  PASSWORD_CHANGED = 'password:changed',
  BIOMETRICS_ENABLED = 'biometrics:enabled',
  BIOMETRICS_DISABLED = 'biometrics:disabled',

  // Security events
  SCREENSHOT_DETECTED = 'security:screenshot',
  UNLOCK_FAILED = 'security:unlock_failed',
  RATE_LIMITED = 'security:rate_limited',
}

export const EVENT_CHANNEL = 'purro-wallet-events';
