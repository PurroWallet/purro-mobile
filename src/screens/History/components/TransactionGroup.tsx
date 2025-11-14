import React from 'react';
import { Text, View } from 'react-native';
import type { TokenTransfer } from '@/core/apis/hyperscan/types';
import TransactionItem from './TransactionItem';

interface TransactionGroupProps {
  date: string;
  transactions: TokenTransfer[];
  onTransactionPress?: (transaction: TokenTransfer) => void;
}

/**
 * TransactionGroup Component
 * Groups transactions by date with a date header
 *
 * @param date - Date label (e.g., "Today", "Yesterday", "Oct 15")
 * @param transactions - List of transactions for this date
 * @param onTransactionPress - Callback when a transaction is tapped
 */
const TransactionGroup: React.FC<TransactionGroupProps> = ({
  date,
  transactions,
  onTransactionPress,
}) => {
  return (
    <View>
      <Text className="text-lg font-semibold my-2.5 px-4 text-text-primary">{date}</Text>
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.tx_hash}
          transaction={transaction}
          onPress={onTransactionPress}
        />
      ))}
    </View>
  );
};

export default TransactionGroup;
