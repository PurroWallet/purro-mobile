import { NativeModules, Platform } from 'react-native';

const { RNHelpersModule } = NativeModules;

export default {
  async iosExcludeFileFromBackup(filePath: string): Promise<boolean> {
    if (Platform.OS !== 'ios') return true; // Non-iOS platforms don't need exclusion

    if (!RNHelpersModule) {
      // Silently handle missing module - this is expected in development/simulator
      // In production, this should be properly linked
      return true;
    }

    try {
      await RNHelpersModule.excludeFromBackup(filePath);
      return true;
    } catch {
      // Log error but don't fail the app flow
      console.log(
        `Note: Could not exclude ${filePath} from backup (this is normal in development)`,
      );
      return true;
    }
  },
};
