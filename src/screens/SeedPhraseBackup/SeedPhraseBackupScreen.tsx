import React from 'react';
import { SeedPhraseBackupContent } from './components/SeedPhraseBackupContent';
import { useSeedPhraseBackupScreen } from './hooks/useSeedPhraseBackupScreen';

const SeedPhraseBackupScreen: React.FC = () => {
  const screenProps = useSeedPhraseBackupScreen();

  return <SeedPhraseBackupContent {...screenProps} />;
};

export default SeedPhraseBackupScreen;
