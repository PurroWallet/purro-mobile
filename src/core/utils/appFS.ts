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
      await RNHelpers.iosExcludeFileFromBackup(file);
      console.log(`✅ Excluded ${file} from iOS backup`);
    } catch (error) {
      console.error(
        `RNHelpersModule not available, skipping backup exclusion for ${file}:`,
        error,
      );
    }
  }
}
