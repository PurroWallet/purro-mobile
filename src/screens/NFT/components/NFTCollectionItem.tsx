import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import type { NFTCollection } from '@/core/apis/hyperscan/types';

interface NFTCollectionItemProps {
  /** NFT collection data */
  collection: NFTCollection;
  /** Collection press handler */
  onPress?: () => void;
}

/**
 * NFTCollectionItem Component
 * Displays a single NFT collection with image, name, and count
 * Supports lazy image loading with placeholder
 */
const NFTCollectionItem: React.FC<NFTCollectionItemProps> = ({ collection, onPress }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Get first NFT instance image if available
  const firstInstance = collection.token_instances?.[0];
  const imageUrl = firstInstance?.metadata?.image;

  // Calculate NFT count
  const nftCount = parseInt(collection.amount, 10) || 0;

  return (
    <TouchableOpacity
      className="rounded-xl bg-background-secondary overflow-hidden mb-3"
      style={{ width: '48%' }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* NFT Image */}
      <View className="w-full aspect-square bg-background-tertiary items-center justify-center">
        {imageUrl && !imageError ? (
          <>
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
            {imageLoading && (
              <View className="absolute inset-0 bg-background-tertiary items-center justify-center">
                <Text className="text-text-tertiary text-xs">
                  {t('nft.loading', { defaultValue: 'Loading...' })}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View className="items-center justify-center">
            <Text className="text-text-secondary text-2xl font-bold">
              {collection.token.symbol?.slice(0, 2).toUpperCase() || 'NFT'}
            </Text>
          </View>
        )}
      </View>

      {/* NFT Info */}
      <View className="p-3">
        <Text className="text-text-primary text-sm font-medium mb-1" numberOfLines={1}>
          {collection.token.name ||
            t('nft.unknownCollection', { defaultValue: 'Unknown Collection' })}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-text-secondary text-xs" numberOfLines={1}>
            {collection.token.symbol || ''}
          </Text>
          <Text className="text-text-tertiary text-xs">
            {nftCount}{' '}
            {nftCount === 1
              ? t('nft.item', { defaultValue: 'item' })
              : t('nft.items', { defaultValue: 'items' })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NFTCollectionItem;
