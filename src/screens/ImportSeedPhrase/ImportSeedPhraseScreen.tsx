import React from 'react';
import { ImportSeedPhraseContent } from './components/ImportSeedPhraseContent';
import { useImportSeedPhraseScreen } from './hooks/useImportSeedPhraseScreen';

const ImportSeedPhraseScreen: React.FC = () => {
  const screenProps = useImportSeedPhraseScreen();

  return <ImportSeedPhraseContent {...screenProps} />;
};

export default ImportSeedPhraseScreen;
