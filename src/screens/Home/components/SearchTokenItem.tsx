import React, { useState } from 'react';
import { Image as RNImage, Text, TouchableOpacity, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Icon } from '@/components/Icon';
import { hyperliquidService } from '@/core/apis/hyperliquid';
import { useTokenMarketData } from '@/core/hooks/useTokenMarketData';

interface SearchToken {
  id: string;
  symbol: string;
  name: string;
  icon?: string;
  verified: boolean;
  transfers24h: number;
}

interface SearchTokenItemProps {
  token: SearchToken;
  formatNumber: (num: number) => string;
}

const SearchTokenItem: React.FC<SearchTokenItemProps> = ({ token, formatNumber }) => {
  const [imageError, setImageError] = useState(false);

  const { tokenInfo } = useTokenMarketData(token.symbol);
  const iconUrl =
    token.icon || tokenInfo?.logo || hyperliquidService.getSpotTokenImage(token.symbol);

  return (
    <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-border-secondary">
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 rounded-full overflow-hidden items-center justify-center bg-background-tertiary">
          <RNImage
            source={{ uri: iconUrl }}
            className="w-12 h-12"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </View>

        <View className="flex-1 ml-4">
          <View className="flex-row items-center mb-1">
            <Text className="text-text-primary text-lg font-semibold">{token.symbol}</Text>
            {token.verified && (
              <View className="ml-2">
                <Icon name="badge-check" size={16} color="#3B82F6" />
              </View>
            )}
          </View>
          <Text className="text-text-secondary text-sm">{token.name}</Text>
        </View>
      </View>

      <View className="items-end">
        <Text className="text-text-primary text-lg font-semibold mb-1">
          {formatNumber(token.transfers24h)}
        </Text>
        <Text className="text-text-secondary text-xs">24h Transfers</Text>
      </View>
    </TouchableOpacity>
  );
};

export default SearchTokenItem;
