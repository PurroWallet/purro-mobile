import React from 'react';
import { SeedPhraseDisplayContent } from './components/SeedPhraseDisplayContent';
import { useSeedPhraseDisplayScreen } from './hooks/useSeedPhraseDisplayScreen';

const SeedPhraseDisplayScreen: React.FC = () => {
  const screenProps = useSeedPhraseDisplayScreen();

  return <SeedPhraseDisplayContent {...screenProps} />;
};

export default SeedPhraseDisplayScreen;
