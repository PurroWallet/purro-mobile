import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { TokenTransfer } from '@/core/apis/hyperscan/types';
import { useCurrentAccount } from '@/core/hooks/wallet/useCurrentAccount';

interface TransactionItemProps {
  transaction: TokenTransfer;
  onPress?: (transaction: TokenTransfer) => void;
}

/**
 * TransactionItem Component
 * Displays a single transaction with icon, token info, amount, and timestamp
 *
 * @param transaction - Transaction data to display
 * @param onPress - Callback when transaction is tapped
 */
const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const { currentAccount } = useCurrentAccount();

  // Determine if this is a sent or received transaction
  const isSent = useMemo(() => {
    if (!currentAccount?.address) return false;
    return transaction.from.hash.toLowerCase() === currentAccount.address.toLowerCase();
  }, [transaction.from.hash, currentAccount?.address]);

  // Format the amount with proper sign
  const formattedAmount = useMemo(() => {
    const amount =
      parseFloat(transaction.total.value) / Math.pow(10, parseInt(transaction.total.decimals));
    const sign = isSent ? '-' : '+';
    return `${sign}${amount.toFixed(4)} ${transaction.token.symbol}`;
  }, [transaction.total.value, transaction.total.decimals, transaction.token.symbol, isSent]);

  // Format timestamp to time only (HH:MM)
  const formattedTime = useMemo(() => {
    const date = new Date(transaction.timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, [transaction.timestamp]);

  // Truncate transaction hash
  const truncatedHash = useMemo(() => {
    return `${transaction.tx_hash.slice(0, 6)}...${transaction.tx_hash.slice(-4)}`;
  }, [transaction.tx_hash]);

  // Icon and color based on transaction type
  const iconColor = '#059288';
  const Icon = isSent ? ArrowUpRight : ArrowDownLeft;
  const amountColorClass = isSent ? 'text-system-error' : 'text-system-success';

  const handlePress = () => {
    onPress?.(transaction);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-center my-1 p-4 border-b border-border-secondary"
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-full justify-center items-center bg-background-secondary">
        <Icon size={20} color={iconColor} />
      </View>

      <View className="ml-3 flex-1">
        <View className="flex-row justify-between mb-1">
          <Text className="text-base font-medium text-text-primary">
            {isSent ? 'Sent' : 'Received'} {transaction.token.symbol}
          </Text>
        </View>

        <View className="flex-row justify-between mb-1">
          <Text className="text-sm text-text-secondary">{formattedTime}</Text>
          <Text className="text-sm text-text-secondary">{truncatedHash}</Text>
        </View>

        <View className="flex-row items-center">
          <Text className={`text-base font-medium ${amountColorClass}`}>{formattedAmount}</Text>
          <View className="flex-row items-center ml-auto">
            <Text className="text-xs text-text-secondary">HyperEVM</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionItem;
