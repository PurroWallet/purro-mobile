import React, { useEffect, useState } from 'react';
import { StyleSheet, AppState, AppStateStatus, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';

export interface PrivacyBlurProps {
  children: React.ReactNode;
  blurType?: 'light' | 'dark';
  blurAmount?: number;
}

/**
 * Privacy Blur Component
 * Shows blur overlay when app goes to background/multitasking
 * Protects sensitive information from being visible in app switcher
 */
export const PrivacyBlur: React.FC<PrivacyBlurProps> = ({
  children,
  blurType = 'dark',
  blurAmount = Platform.OS === 'ios' ? 15 : 10,
}) => {
  const [showBlur, setShowBlur] = useState(false);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App going to background - show blur immediately
        setShowBlur(true);
        console.log('🔒 App background detected - showing privacy blur');
      } else if (nextAppState === 'active') {
        // App coming to foreground - hide blur
        setShowBlur(false);
        console.log('🔓 App foreground detected - hiding privacy blur');
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
      {children}
      {showBlur && (
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType={blurType}
          blurAmount={blurAmount}
          reducedTransparencyFallbackColor="#161616"
        />
      )}
    </>
  );
};
