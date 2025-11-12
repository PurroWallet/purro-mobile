import React from 'react';
import { WelcomeContent } from './components/WelcomeContent';
import { useWelcomeScreen } from './hooks/useWelcomeScreen';

const WelcomeScreen: React.FC = () => {
  const screenProps = useWelcomeScreen();

  return <WelcomeContent {...screenProps} />;
};

export default WelcomeScreen;
