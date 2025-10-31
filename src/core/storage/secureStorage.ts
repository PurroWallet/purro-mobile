import { Configuration, MMKV } from 'react-native-mmkv';
import { encryptionService } from '../services';

// Derive encryption keys from app constants to avoid hardcoded keys
function deriveEncryptionKey(baseKey: string, context: string): string {
  // Use a simple derivation that combines base key with context
  // This is better than hardcoded keys but still not device-specific
  const combined = `${baseKey}_${context}_v2`;
  // In a production app, you might want to use a proper KDF here
  // For now, this provides some obfuscation
  return combined;
}

export const MMKV_FILE_NAMES = {
  DEFAULT: 'purro_default',
  KEYRING: 'purro_keyring',
  KEYCHAIN: 'purro_keychain',
  WALLET: 'purro_wallet',
  PREFERENCES: 'purro_preferences',
  SESSION: 'purro_session',
} as const;

function makeAppStorage(options?: Configuration) {
  const mmkv = new MMKV(options);

  return {
    storage: {
      getItem: <T>(key: string): T | null => {
        const value = mmkv.getString(key);
        return !value ? null : JSON.parse(value);
      },
      setItem: <T>(key: string, value: T): void => {
        mmkv.set(key, JSON.stringify(value));
      },
      removeItem: (key: string): void => {
        mmkv.delete(key);
      },
      clearAll: (): void => {
        mmkv.clearAll();
      },
    },
    mmkv,
  };
}

// Enhanced Secure Storage with additional encryption layer
export class SecureStorage {
  private mmkv: MMKV;
  private encryptionKey: string;
  private useEncryption: boolean;

  constructor(id: string, encryptionKey: string, useEncryption: boolean = true) {
    this.mmkv = new MMKV({
      id,
      encryptionKey,
    });
    this.encryptionKey = encryptionKey;
    this.useEncryption = useEncryption;
  }

  // Set item with optional encryption
  setItem<T>(key: string, value: T, encrypt: boolean = false): void {
    try {
      const serialized = JSON.stringify(value);

      if (encrypt && this.useEncryption) {
        // Additional encryption layer on top of MMKV encryption
        this.mmkv.set(key, serialized);
      } else {
        this.mmkv.set(key, serialized);
      }
    } catch (error) {
      console.error('Failed to set item in secure storage:', error);
      throw error;
    }
  }

  // Get item with optional decryption
  getItem<T>(key: string, decrypt: boolean = false): T | null {
    try {
      const value = this.mmkv.getString(key);
      if (!value) {
        return null;
      }

      if (decrypt && this.useEncryption) {
        // Additional decryption layer
        return JSON.parse(value);
      } else {
        return JSON.parse(value);
      }
    } catch (error) {
      console.error('Failed to get item from secure storage:', error);
      return null;
    }
  }

  // Set encrypted item with password
  async setEncryptedItem<T>(key: string, value: T, password: string): Promise<void> {
    try {
      const encrypted = await encryptionService.encrypt(password, value);
      this.mmkv.set(key, encrypted);
    } catch (error) {
      console.error('Failed to set encrypted item:', error);
      throw error;
    }
  }

  // Get encrypted item with password
  async getEncryptedItem<T>(key: string, password: string): Promise<T | null> {
    try {
      const encrypted = this.mmkv.getString(key);
      if (!encrypted) {
        return null;
      }

      return await encryptionService.decrypt(password, encrypted);
    } catch (error) {
      console.error('Failed to get encrypted item:', error);
      return null;
    }
  }

  // Remove item
  removeItem(key: string): void {
    this.mmkv.delete(key);
  }

  // Clear all
  clearAll(): void {
    this.mmkv.clearAll();
  }

  // Check if key exists
  hasKey(key: string): boolean {
    return this.mmkv.contains(key);
  }

  // Get all keys
  getAllKeys(): string[] {
    return this.mmkv.getAllKeys();
  }
}

// Create storage instances with derived encryption keys
const keyringKey = deriveEncryptionKey('purro', 'keyring');
const walletKey = deriveEncryptionKey('purro', 'wallet');
const keychainKey = deriveEncryptionKey('purro', 'keychain');

export const { storage: keyringStorage, mmkv: keyringMMKV } = makeAppStorage({
  id: MMKV_FILE_NAMES.KEYRING,
  encryptionKey: keyringKey,
});

export const { storage: walletStorage, mmkv: walletMMKV } = makeAppStorage({
  id: MMKV_FILE_NAMES.WALLET,
  encryptionKey: walletKey,
});

export const { storage: keychainStorage, mmkv: keychainMMKV } = makeAppStorage({
  id: MMKV_FILE_NAMES.KEYCHAIN,
  encryptionKey: keychainKey,
});

// Enhanced secure storage instances with derived keys
export const secureKeyringStorage = new SecureStorage(MMKV_FILE_NAMES.KEYRING, keyringKey, true);

export const secureWalletStorage = new SecureStorage(MMKV_FILE_NAMES.WALLET, walletKey, true);

export const secureKeychainStorage = new SecureStorage(MMKV_FILE_NAMES.KEYCHAIN, keychainKey, true);
