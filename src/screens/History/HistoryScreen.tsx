import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { TokenTransfer } from '@/core/apis/hyperscan/types';
import { useTranslation } from '@/utils/i18n';
import TransactionList from './components/TransactionList';

const HistoryScreen: React.FC = () => {
  const { t } = useTranslation();

  const handleTransactionPress = useCallback((transaction: TokenTransfer) => {
    // TODO: Navigate to transaction details screen
    console.log('Transaction pressed:', transaction.tx_hash);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header */}
      <View className="px-4 py-3 bg-primary">
        <Text className="text-3xl font-bold text-text-primary">{t('home.nav.history')}</Text>
      </View>

      {/* Transaction List */}
      <TransactionList onTransactionPress={handleTransactionPress} />
    </SafeAreaView>
  );
};

export default HistoryScreen;
