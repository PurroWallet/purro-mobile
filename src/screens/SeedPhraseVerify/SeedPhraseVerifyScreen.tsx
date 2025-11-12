import React from 'react';
import { SeedPhraseVerifyContent } from './components/SeedPhraseVerifyContent';
import { useSeedPhraseVerifyScreen } from './hooks/useSeedPhraseVerifyScreen';

const SeedPhraseVerifyScreen: React.FC = () => {
  const screenProps = useSeedPhraseVerifyScreen();

  return <SeedPhraseVerifyContent {...screenProps} />;
};

export default SeedPhraseVerifyScreen;
