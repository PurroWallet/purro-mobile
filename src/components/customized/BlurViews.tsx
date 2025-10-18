import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';

import { useIsOnBackground } from '../../hooks/useLock';
import { IS_ANDROID } from '../../core/native/utils';

export function BackgroundSecureBlurView() {
  const { isOnBackground } = useIsOnBackground();
  if (!isOnBackground || IS_ANDROID) return null;

  return (
    <BlurView
      style={StyleSheet.absoluteFill}
      blurType="light"
      blurAmount={10}
      reducedTransparencyFallbackColor="#161616"
    />
  );
}

export function SafeTipModalBlurView() {
  const { isOnBackground } = useIsOnBackground();

  if (!isOnBackground) return null;

  return (
    <BlurView
      style={StyleSheet.absoluteFill}
      blurType="light"
      blurAmount={10}
      reducedTransparencyFallbackColor="#161616"
    />
  );
}
