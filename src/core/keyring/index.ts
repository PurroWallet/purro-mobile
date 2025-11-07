export * from 'bip39';
export * from './AbstractKeyring';
export * from './HDKeyring';
export * from './SimpleKeyring';
export * from './types';

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
