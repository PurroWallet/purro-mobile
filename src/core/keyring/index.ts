// Export all keyring types and implementations
export * from './types';
export * from './AbstractKeyring';
export * from './HDKeyring';
export * from './SimpleKeyring';

// Factory function to create keyring by type
import { IKeyring, KEYRING_TYPE } from './types';
import { HDKeyring } from './HDKeyring';
import { SimpleKeyring } from './SimpleKeyring';

export function createKeyring(type: KEYRING_TYPE, options?: any): IKeyring {
  switch (type) {
    case KEYRING_TYPE.HD:
      return new HDKeyring(options);
    case KEYRING_TYPE.Simple:
      return new SimpleKeyring(options?.privateKey);
    default:
      throw new Error(`Unknown keyring type: ${type}`);
  }
}

// Utility function to validate mnemonic
import * as bip39 from 'bip39';

export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

// Utility function to generate mnemonic
export function generateMnemonic(strength: number = 128): string {
  return bip39.generateMnemonic(strength);
}

// Utility function to validate private key
export function validatePrivateKey(privateKey: string): boolean {
  // Remove 0x prefix if present
  const key = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  
  // Validate private key format (64 hex characters)
  return /^[a-fA-F0-9]{64}$/.test(key);
}