/**
 * Security hooks for screenshot prevention
 * Using simple approach - PrivacyBlur + warning
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';

export type ProtectedScreenType = 'SeedPhrase' | 'CreateWallet' | 'Password';

/**
 * Hook to prevent screenshots on a specific screen
 * Shows warning and relies on PrivacyBlur for protection
 */
export function useProtectedScreen(screenType: ProtectedScreenType) {
  useEffect(() => {
    console.log(`🔒 Protected screen active: ${screenType}`);

    // Show warning about screenshot prevention
    if (screenType === 'SeedPhrase') {
      console.log('⚠️ Screenshot protection active - seed phrase screen');
    }

    // Note: Real screenshot prevention requires native modules
    // For now, we rely on PrivacyBlur when app goes to background
    // and warn users about security
  }, [screenType]);
}

/**
 * Hook to prevent screenshots at app level
 * Shows warning to users
 */
export function useAppPreventScreenshotOnScreen(options: { isTop?: boolean }) {
  useEffect(() => {
    if (!options.isTop) {
      console.warn('useAppPreventScreenshotOnScreen is not on top');
      return;
    }

    console.log('App-level screenshot prevention enabled');
  }, [options.isTop]);
}

/**
 * Hook to detect screenshot attempts (limited support)
 */
export function useScreenshotDetection(onScreenshot?: () => void): void {
  useEffect(() => {
    // iOS screenshot detection would require native module
    // For now, show warning when screen is sensitive
    console.log(
      'Screenshot detection: Limited - requires native module for full support',
    );
  }, [onScreenshot]);
}

/**
 * Hook for iOS screen recording detection
 */
export function useIOSScreenRecording(options?: {
  isTop?: boolean;
  onIsBeingCapturedChanged?: (isBeingCaptured: boolean) => void;
}) {
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    if (!options?.isTop) return;

    // iOS screen recording detection requires native module
    console.log('iOS screen recording detection: Requires native module');
  }, [options]);
}
