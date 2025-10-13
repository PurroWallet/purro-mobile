/**
 * Services Index
 * Central export point for all core services
 */

export { appEncryptor, Encryptor } from './encryptor';
export type { EncryptorAdapter } from './encryptor';

export { HDKeyring, validateMnemonic, generateMnemonic } from './hdKeyring';
export type { HDKeyringOptions, HDKeyringData } from './hdKeyring';

export { keyringService } from './keyring';
export type { KeyringData } from './keyring';

export {
  secureKeychain,
  KEYCHAIN_AUTH_TYPES,
  isAuthenticatedByBiometrics,
} from './keychain';

export { lockService } from './lock';
export type { UnlockResult } from './lock';

export { screenProtection } from './screenProtection';
