import { MMKV, MMKVConfiguration } from 'react-native-mmkv';

export const MMKV_FILE_NAMES = {
  DEFAULT: 'purro_default',
  KEYRING: 'purro_keyring',
  KEYCHAIN: 'purro_keychain',
  WALLET: 'purro_wallet',
  PREFERENCES: 'purro_preferences',
  SESSION: 'purro_session',
} as const;

function makeAppStorage(options?: MMKVConfiguration) {
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

// Separate encrypted storage for keyrings
export const { storage: keyringStorage, mmkv: keyringMMKV } = makeAppStorage({
  id: MMKV_FILE_NAMES.KEYRING,
  encryptionKey: 'purro_keyring_v1',
});

// Separate encrypted storage for wallet data
export const { storage: walletStorage, mmkv: walletMMKV } = makeAppStorage({
  id: MMKV_FILE_NAMES.WALLET,
  encryptionKey: 'purro_wallet_v1',
});

// Keychain storage
export const { storage: keychainStorage } = makeAppStorage({
  id: MMKV_FILE_NAMES.KEYCHAIN,
});
