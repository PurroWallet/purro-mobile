export * from 'bip39';
export * from './AbstractKeyring';
export * from './HDKeyring';
export * from './SimpleKeyring';
export * from './types';

import { generateMnemonic as bip39GenerateMnemonic } from 'bip39';

/**
 * Generate a new 12-word BIP39 mnemonic phrase
 * This is the centralized function for all mnemonic generation in the app
 */
export function generateMnemonic(): string {
  return bip39GenerateMnemonic(128); // 128 bits = 12 words
}

import { ethers } from 'ethers';
import { HDKeyring } from './HDKeyring';
import { SimpleKeyring } from './SimpleKeyring';
import { IKeyring, KEYRING_TYPE } from './types';

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

export function validatePrivateKey(privateKey: string): boolean {
  try {
    const keyWithoutPrefix = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
    return ethers.utils.isHexString(keyWithoutPrefix, 32);
  } catch {
    return false;
  }
}
