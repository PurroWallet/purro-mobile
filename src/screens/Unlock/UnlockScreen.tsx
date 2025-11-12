import type { FC } from 'react';
import React from 'react';
import type { UnlockScreenProps } from '@/types/navigation';
import { UnlockContent } from './components/UnlockContent';
import { useUnlockScreen } from './hooks/useUnlockScreen';

const UnlockScreen: FC<UnlockScreenProps> = ({ navigation }) => {
  const screenProps = useUnlockScreen(navigation);

  return <UnlockContent {...screenProps} />;
};

export default UnlockScreen;
