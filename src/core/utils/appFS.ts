import RNHelpers from '../native/RNHelpers';
import { Platform } from 'react-native';

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
      const excluded = await RNHelpers.iosExcludeFileFromBackup(file);
      if (excluded) {
        console.log(`✅ Excluded ${file} from iOS backup`);
      }
    } catch {
      // Silently handle backup exclusion errors
      console.log(`Note: Backup exclusion for ${file} skipped (normal in development)`);
    }
  }
}
