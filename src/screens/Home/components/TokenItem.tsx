import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Icon } from '@/components/Icon';
import type { ChainTokenData, TokenWithMetadata } from '@/core/apis/alchemy/types';

interface TokenItemProps {
  /** Token data */
  token: TokenWithMetadata;
  /** Chain identifier */
  chain: ChainTokenData['chain'];
  /** Token press handler */
  onPress?: () => void;
  /** Send action handler */
  onSend?: () => void;
  /** Swap action handler */
  onSwap?: () => void;
}

/**
 * TokenItem Component
 * Displays a single token with logo, symbol, name, and balance
 * Supports swipe actions for send and swap
 */
const TokenItem: React.FC<TokenItemProps> = ({ token, chain, onPress, onSend, onSwap }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = -100;
  const ACTION_WIDTH = 80;

  // Calculate formatted balance
  const formattedBalance = (parseFloat(token.balance) / 10 ** token.metadata.decimals).toFixed(4);

  // Swipe gesture handler
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, SWIPE_THRESHOLD);
      } else {
        translateX.value = 0;
      }
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD / 2) {
        translateX.value = withSpring(SWIPE_THRESHOLD);
      } else {
        translateX.value = withSpring(0);
      }
    });

  // Animated style for swipe
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Handle action button press
  const handleActionPress = (action: 'send' | 'swap') => {
    'worklet';
    translateX.value = withSpring(0);
    if (action === 'send' && onSend) {
      runOnJS(onSend)();
    } else if (action === 'swap' && onSwap) {
      runOnJS(onSwap)();
    }
  };

  return (
    <View className="mb-2 overflow-hidden">
      {/* Action Buttons (behind the item) */}
      <TouchableOpacity
        className="rounded-xl bg-background-secondary px-4 py-5 flex-row items-center gap-5"
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Token Logo */}
        <View className="w-12 h-12 rounded-full bg-background-tertiary items-center justify-center overflow-hidden">
          {token.metadata.logo && !imageError ? (
            <Image
              source={{ uri: token.metadata.logo }}
              className="w-full h-full"
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Text className="text-text-secondary text-sm font-medium">
              {token.metadata.symbol.slice(0, 2).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Token Info */}
        <View className="flex-1">
          <Text className="text-text-primary text-base font-medium" numberOfLines={1}>
            {token.metadata.name}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-text-secondary text-sm">{token.metadata.symbol}</Text>
            <Text className="text-text-tertiary text-xs">•</Text>
            <Text className="text-text-tertiary text-xs capitalize">{chain}</Text>
          </View>
        </View>

        {/* Token Balance */}
        <View className="items-end">
          <Text className="text-text-primary text-base font-medium" numberOfLines={1}>
            {formattedBalance}
          </Text>
          <Text className="text-text-secondary text-sm">{token.metadata.symbol}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default TokenItem;
