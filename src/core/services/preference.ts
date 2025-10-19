/**
 * Preference service for storing user preferences
 */

import { MMKV } from 'react-native-mmkv';
import { MMKV_FILE_NAMES } from '../storage';

let storage: MMKV | null = null;

const getStorage = (): MMKV => {
  if (!storage) {
    try {
      storage = new MMKV({
        id: MMKV_FILE_NAMES.PREFERENCES,
        encryptionKey: 'purro_preferences_v1',
      });
    } catch (error) {
      throw new Error(
        'MMKV requires JSI. Please disable Chrome/Remote debugger and reload the app.',
      );
    }
  }
  return storage;
};

export interface PreferenceData {
  biometricsEnabled?: boolean;
  language?: string;
  currency?: string;
  themeMode?: 'light' | 'dark';
}

class PreferenceService {
  getPreference<K extends keyof PreferenceData>(key: K): PreferenceData[K] | undefined {
    try {
      const value = getStorage().getString(key);
      return value ? JSON.parse(value) : undefined;
    } catch (error) {
      console.error(`Failed to get preference ${String(key)}:`, error);
      return undefined;
    }
  }

  setPreference<K extends keyof PreferenceData>(key: K, value: PreferenceData[K]): void {
    try {
      getStorage().set(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set preference ${String(key)}:`, error);
    }
  }

  clearPreferences(): void {
    getStorage().clearAll();
  }
}

export const preferenceService = new PreferenceService();
