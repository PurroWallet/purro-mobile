import React from 'react';
import { BlurView } from '@react-native-community/blur';

import { useIsOnBackground } from '../../core/hooks/useLock';
import { IS_ANDROID } from '../../core/native/utils';

export function BackgroundSecureBlurView() {
  const { isOnBackground } = useIsOnBackground();
  if (!isOnBackground || IS_ANDROID) return null;

  return (
    <BlurView
      className="absolute inset-0"
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
      className="absolute inset-0"
      blurType="light"
      blurAmount={10}
      reducedTransparencyFallbackColor="#161616"
    />
  );
}
