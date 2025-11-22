import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react-native';
import React from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, Text, View } from 'react-native';

const mockTransactions: Section[] = [
  {
    date: 'October, 2025',
    items: [
      {
        id: '1',
        iconType: 'sent',
        title: 'Sent PURRO',
        status: 'Failed',
        time: '00:21',
        day: 'Today',
        amount: '4 PURRO',
        network: 'HyperEVM',
        amountColor: 'error',
      },
      {
        id: '2',
        iconType: 'sent',
        title: 'Sent PURRO',
        time: '00:21',
        day: 'Today',
        amount: '-4 PURRO',
        network: 'HyperEVM',
        amountColor: 'error',
      },
      {
        id: '3',
        iconType: 'swap',
        title: 'WHYPE → PURRO',
        time: '21:21',
        day: 'Yesterday',
        amount: '-0.25 WHYPE',
        secondaryAmount: '+74.48.. PURRO',
        secondaryAmountColor: 'success',
        network: 'HyperEVM',
        amountColor: 'primary',
      },
    ],
  },
];

interface TransactionItem {
  id: string;
  iconType: 'sent' | 'received' | 'swap';
  title: string;
  status?: string;
  time: string;
  day: string;
  amount: string;
  network: string;
  amountColor: string;
  secondaryAmount?: string;
  secondaryAmountColor?: string;
}

interface Section {
  date: string;
  items: TransactionItem[];
}

const HistoryList = () => {
  const getColorClass = (colorType: string) => {
    switch (colorType) {
      case 'error':
        return 'text-system-error';
      case 'success':
        return 'text-system-success';
      case 'primary':
        return 'text-text-primary';
      default:
        return 'text-text-primary';
    }
  };

  const renderIcon = (iconType: string) => {
    const iconColor = '#059288';
    switch (iconType) {
      case 'sent':
        return <ArrowUpRight size={16} color={iconColor} />;
      case 'received':
        return <ArrowDownLeft size={16} color={iconColor} />;
      case 'swap':
        return <ArrowLeftRight size={16} color={iconColor} />;
      default:
        return <ArrowUpRight size={16} color={iconColor} />;
    }
  };

  const renderItem: ListRenderItem<TransactionItem> = ({ item }) => (
    <View className="flex-row items-center my-1 p-4 border-b border-border-secondary">
      <View className="w-10 h-10 rounded-full justify-center items-center bg-background-secondary">
        {renderIcon(item.iconType)}
      </View>
      <View className="ml-3 flex-1">
        <View className="flex-row justify-between mb-1">
          <Text className="text-base font-medium text-text-primary">{item.title}</Text>
          {item.status && <Text className="text-sm text-system-error">{item.status}</Text>}
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm text-text-secondary">{item.time}</Text>
          <Text className="text-sm text-text-secondary">{item.day}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className={`text-base font-medium mr-2 ${getColorClass(item.amountColor)}`}>
            {item.amount}
          </Text>
          {item.secondaryAmount && (
            <Text
              className={`text-base font-medium mr-2 ${getColorClass(item.secondaryAmountColor || 'primary')}`}
            >
              {item.secondaryAmount}
            </Text>
          )}
          <View className="flex-row items-center ml-auto">
            <Text className="text-xs text-text-secondary">{item.network}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSection: ListRenderItem<Section> = ({ item }) => (
    <View>
      <Text className="text-lg font-semibold my-2.5 px-4 text-text-primary">{item.date}</Text>
      <FlatList data={item.items} renderItem={renderItem} keyExtractor={(subItem) => subItem.id} />
    </View>
  );

  return (
    <FlatList<Section>
      data={mockTransactions}
      renderItem={renderSection}
      keyExtractor={(section) => section.date}
      className="flex-1"
    />
  );
};

export default HistoryList;
