/**
 * APIs Index
 * Central export point for all core APIs
 */

// Re-export keychain for biometric setup
export { secureKeychain as apisKeychain } from '../services/keychain';
// Re-export legacy lock APIs if needed
export { apisLock } from './lock';
export { apisWallet } from './wallet';
