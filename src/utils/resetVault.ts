/**
 * Utility to reset vault - USE ONLY FOR DEBUGGING
 * WARNING: This will delete all wallet data permanently!
 */

import { keyringStorage } from '../core/storage/secureStorage';

export function resetVault(): void {
  console.warn('⚠️ RESETTING VAULT - ALL WALLET DATA WILL BE DELETED!');

  // Delete vault
  keyringStorage.removeItem('vault');

  // Delete other sensitive data
  keyringStorage.removeItem('currentAddress');

  console.log('✅ Vault reset complete. You can now create a new wallet.');
}

// For testing in dev console
if (__DEV__) {
  (global as any).resetVault = resetVault;
}
