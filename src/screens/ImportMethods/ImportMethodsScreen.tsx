import React from 'react';
import { ImportMethodsContent } from './components/ImportMethodsContent';
import { useImportMethodsScreen } from './hooks/useImportMethodsScreen';

const ImportMethodsScreen: React.FC = () => {
  const screenProps = useImportMethodsScreen();

  return <ImportMethodsContent {...screenProps} />;
};

export default ImportMethodsScreen;
