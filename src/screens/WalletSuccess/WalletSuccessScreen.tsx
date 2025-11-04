import React from 'react';
import type { WalletSuccessScreenProps } from '@/types/navigation';
import { WalletSuccessContent } from './components/WalletSuccessContent';
import { useWalletSuccessScreen } from './hooks/useWalletSuccessScreen';

const WalletSuccessScreen: React.FC<WalletSuccessScreenProps> = ({ navigation }) => {
  const screenProps = useWalletSuccessScreen(navigation);

  return <WalletSuccessContent {...screenProps} />;
};

export default WalletSuccessScreen;
