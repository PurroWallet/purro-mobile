import React from 'react';
import { SwapContent } from './components/SwapContent';
import { useSwapScreen } from './hooks/useSwapScreen';

const SwapScreen: React.FC = () => {
  const screenProps = useSwapScreen();

  return <SwapContent {...screenProps} />;
};

export default SwapScreen;
