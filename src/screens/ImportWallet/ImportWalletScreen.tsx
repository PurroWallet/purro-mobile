import React from 'react';
import type { ImportWalletScreenProps } from '@/types/navigation';
import { ImportWalletContent } from './components/ImportWalletContent';
import { useImportWalletScreen } from './hooks/useImportWalletScreen';

const ImportWalletScreen: React.FC<ImportWalletScreenProps> = ({ navigation }) => {
  const screenProps = useImportWalletScreen(navigation);

  return <ImportWalletContent {...screenProps} />;
};

export default ImportWalletScreen;
