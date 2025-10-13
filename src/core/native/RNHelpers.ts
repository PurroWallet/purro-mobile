import { NativeModules, Platform } from 'react-native';

const { RNHelpersModule } = NativeModules;

export default {
  async iosExcludeFileFromBackup(filePath: string): Promise<boolean> {
    if (Platform.OS !== 'ios') return true; // Non-iOS platforms don't need exclusion

    if (!RNHelpersModule) {
      console.warn('RNHelpersModule not available, skipping backup exclusion');
      return false;
    }

    try {
      await RNHelpersModule.excludeFromBackup(filePath);
      return true;
    } catch (error) {
      console.error('Failed to exclude file from backup:', error);
      return false;
    }
  },
};
