/**
 * APIs Index
 * Central export point for all core APIs
 */

export { apisWallet } from './wallet';
export type { WalletAccount } from './wallet';

// Re-export legacy lock APIs if needed
export { apisLock } from './lock';

// Re-export keychain for biometric setup
export { secureKeychain as apisKeychain } from '../services/keychain';
