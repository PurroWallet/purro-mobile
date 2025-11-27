import React, { useState } from 'react';
import { Image as RNImage, Text, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import DefaultIcon from '@/assets/common/icon.png';
import type { FormattedSpotToken } from '@/core/apis/hyperliquid';
import { useTokenMarketData } from '@/core/hooks/useTokenMarketData';

interface SpotTokenItemProps {
  token: FormattedSpotToken;
}

const SpotTokenItem: React.FC<SpotTokenItemProps> = ({ token }) => {
  const [imageError, setImageError] = useState(false);

  // Fetch token info from Coinpaprika with React Query caching
  // Note: WETH automatically uses ETH icon via TOKEN_ID_MAP in useTokenMarketData
  const { tokenInfo } = useTokenMarketData(token.symbol);

  // Get icon URL with priority: Hyperliquid > Coinpaprika > Default
  const iconUrl = token.imageUrl || tokenInfo?.logo;

  return (
    <View className="rounded-xl bg-background-secondary px-4 flex-row items-center gap-5 mb-2">
      <View className="w-12 h-12 rounded-full overflow-hidden bg-background-tertiary items-center justify-center">
        <RNImage
          source={{ uri: iconUrl }}
          className="w-12 h-12"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>
      <View className="flex-1 flex-row justify-between items-center py-5">
        <View className="gap-3">
          <Text className="text-text-primary text-xl font-medium">{token.name}</Text>
          <View className="flex-row gap-1.5">
            <Text className="text-text-primary text-sm">{token.balance}</Text>
            <Text className="text-text-secondary text-sm">{token.symbol}</Text>
          </View>
        </View>
        <Text className="text-text-primary text-xl font-medium">{token.value}</Text>
      </View>
    </View>
  );
};

export default SpotTokenItem;
