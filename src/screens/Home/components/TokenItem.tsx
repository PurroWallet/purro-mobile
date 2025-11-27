import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import type { ChainTokenData, TokenWithMetadata } from '@/core/apis/alchemy/types';
import { hyperliquidService } from '@/core/apis/hyperliquid';
import { useTokenMarketData } from '@/core/hooks/useTokenMarketData';

interface TokenItemProps {
  token: TokenWithMetadata;
  chain: ChainTokenData['chain'];
  onPress?: () => void;
  onSend?: () => void;
  onSwap?: () => void;
}

/**
 * TokenItem Component
 * Displays a single token with logo, symbol, name, and balance
 * Supports swipe actions for send and swap
 */
const TokenItem: React.FC<TokenItemProps> = ({ token, onPress }) => {
  const [imageError, setImageError] = useState(false);

  // Calculate formatted balance
  const balanceNum = parseFloat(token.balance) / 10 ** token.metadata.decimals;
  const formattedBalance = balanceNum.toFixed(6).replace(/\.?0+$/, '');

  // Fetch token info (price + logo) from CoinGecko API with React Query caching
  const { tokenInfo } = useTokenMarketData(token.metadata.symbol);

  // Calculate USD value: balance * price
  const tokenPrice = token.price || tokenInfo?.price || 0;
  const calculatedUsdValue = balanceNum * tokenPrice;

  // Use calculated value or fallback to provided balanceUsd
  const usdValue = calculatedUsdValue;
  const formattedUsd = `$${usdValue.toFixed(2)}`;

  // Get icon URL with priority: Alchemy > Coinpaprika > Hyperliquid
  // Note: WETH automatically uses ETH icon via TOKEN_ID_MAP in useTokenMarketData
  const iconUrl =
    token.metadata.logo ||
    tokenInfo?.logo ||
    hyperliquidService.getSpotTokenImage(token.metadata.symbol);

  return (
    <View className="mb-2 overflow-hidden">
      {/* Action Buttons (behind the item) */}
      <TouchableOpacity
        className="rounded-xl bg-background-secondary px-4 py-5 flex-row items-center gap-5"
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Token Logo */}
        <View className="w-12 h-12 rounded-full items-center justify-center overflow-hidden bg-background-tertiary">
          <Image
            source={{ uri: iconUrl }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </View>

        {/* Token Info */}
        <View className="flex-1">
          <Text className="text-text-primary text-lg font-medium" numberOfLines={1}>
            {token.metadata.name}
          </Text>
          <Text className="text-text-primary text-base" numberOfLines={1}>
            {formattedBalance} {token.metadata.symbol}
          </Text>
        </View>

        {/* USD Value */}
        <View className="items-end">
          <Text className="text-text-primary text-xl font-medium" numberOfLines={1}>
            {formattedUsd}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default TokenItem;
