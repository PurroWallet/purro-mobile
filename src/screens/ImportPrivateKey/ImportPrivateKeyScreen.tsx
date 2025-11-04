import React from 'react';
import { ImportPrivateKeyContent } from './components/ImportPrivateKeyContent';
import { useImportPrivateKeyScreen } from './hooks/useImportPrivateKeyScreen';

const ImportPrivateKeyScreen: React.FC = () => {
  const screenProps = useImportPrivateKeyScreen();

  return <ImportPrivateKeyContent {...screenProps} />;
};

export default ImportPrivateKeyScreen;
