import { Platform } from 'react-native';
import RNHelpers from '../native/RNHelpers';

export async function excludeFilesFromBackup() {
  if (Platform.OS !== 'ios') return;

  const files = [
    // MMKV files to exclude
    'purro_keyring',
    'purro_wallet',
    'purro_keychain',
  ];

  for (const file of files) {
    try {
      await RNHelpers.iosExcludeFileFromBackup(file);
    } catch {
      // Silently handle backup exclusion errors
    }
  }
}
