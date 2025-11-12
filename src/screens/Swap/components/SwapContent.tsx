import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { UseSwapScreenResult } from '../hooks/useSwapScreen';

type SwapContentProps = UseSwapScreenResult;

export const SwapContent: React.FC<SwapContentProps> = ({ containerClassName }) => (
  <SafeAreaView className={containerClassName} />
);
