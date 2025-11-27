import { BlurView } from '@react-native-community/blur';
import React, { useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform, View } from 'react-native';
import { useThemeMode } from '@/core/hooks/useTheme';

export interface PrivacyBlurProps {
  children: React.ReactNode;
  blurAmount?: number;
}

/**
 * Privacy Blur Component
 * Shows blur overlay when app goes to background/multitasking
 * Protects sensitive information from being visible in app switcher
 */
export const PrivacyBlur: React.FC<PrivacyBlurProps> = ({ children, blurAmount = 20 }) => {
  const [showBlur, setShowBlur] = useState(false);
  const { themeMode } = useThemeMode();

  // Choose blur type based on theme
  const blurType = themeMode === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setShowBlur(true);
      } else if (nextAppState === 'active') {
        setShowBlur(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View className="flex-1">
      {children}
      {showBlur && (
        <BlurView
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
          blurType={blurType}
          blurAmount={blurAmount}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.8)"
        />
      )}
    </View>
  );
};
