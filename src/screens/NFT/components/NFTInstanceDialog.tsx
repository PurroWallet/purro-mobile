import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import CustomBackground from '@/components/AccountBottomSheet/CustomBackground';
import type { NFTCollection } from '@/core/apis/hyperscan/types';
import { useNFTInstances } from '@/core/hooks/wallet';

interface NFTInstanceDialogProps {
  /** Holder address */
  holderAddress: string;
  /** Whether to use testnet */
  isTestnet?: boolean;
}

export interface NFTInstanceDialogRef {
  present: (collection: NFTCollection) => void;
  dismiss: () => void;
}

/**
 * NFTInstanceDialog Component
 * Displays NFT instances for a specific collection in a bottom sheet modal
 * Supports pagination and lazy image loading
 */
const NFTInstanceDialog = forwardRef<NFTInstanceDialogRef, NFTInstanceDialogProps>(
  ({ holderAddress, isTestnet = false }, ref) => {
    const { t } = useTranslation();
    const bottomSheetRef = useRef<BottomSheetModalMethods>(null);
    const [selectedCollection, setSelectedCollection] = useState<NFTCollection | null>(null);

    // Fetch NFT instances using the hook
    const { instances, isLoading, error, hasNextPage, fetchNextPage, refetch } = useNFTInstances(
      selectedCollection?.token.address || '',
      holderAddress,
      isTestnet,
    );

    // Snap points for the bottom sheet
    const snapPoints = useMemo(() => ['90%'], []);

    // Custom animation configs
    const animationConfigs = useMemo(
      () => ({
        damping: 30,
        overshootClamping: true,
        restDisplacementThreshold: 0.5,
        restSpeedThreshold: 0.5,
        stiffness: 300,
      }),
      [],
    );

    // Custom backdrop
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      [],
    );

    // Custom background
    const renderBackground = useCallback((props: any) => <CustomBackground {...props} />, []);

    // Expose present/dismiss methods
    useImperativeHandle(ref, () => ({
      present: (collection: NFTCollection) => {
        setSelectedCollection(collection);
        bottomSheetRef.current?.present();
      },
      dismiss: () => {
        bottomSheetRef.current?.dismiss();
      },
    }));

    // Handle close
    const handleClose = useCallback(() => {
      bottomSheetRef.current?.dismiss();
    }, []);

    // Handle load more
    const handleLoadMore = useCallback(() => {
      if (hasNextPage && !isLoading) {
        fetchNextPage();
      }
    }, [hasNextPage, isLoading, fetchNextPage]);

    // Render NFT instance item
    const renderNFTInstance = (instance: (typeof instances)[0], index: number) => {
      const [imageError, setImageError] = useState(false);
      const [imageLoading, setImageLoading] = useState(true);
      const imageUrl = instance.metadata?.image;

      return (
        <View key={`${instance.id}-${index}`} className="mb-4">
          {/* NFT Image */}
          <View className="w-full aspect-square bg-background-tertiary rounded-xl overflow-hidden items-center justify-center">
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
                    <ActivityIndicator size="small" />
                  </View>
                )}
              </>
            ) : (
              <View className="items-center justify-center">
                <Text className="text-text-secondary text-2xl font-bold">
                  {selectedCollection?.token.symbol?.slice(0, 2).toUpperCase() || 'NFT'}
                </Text>
              </View>
            )}
          </View>

          {/* NFT Info */}
          <View className="mt-2">
            <Text className="text-text-primary text-sm font-medium" numberOfLines={1}>
              {instance.metadata?.name || `${selectedCollection?.token.name} #${instance.token_id}`}
            </Text>
            <Text className="text-text-secondary text-xs mt-1">
              {t('nft.tokenId', { defaultValue: 'Token ID' })}: {instance.token_id}
            </Text>
          </View>
        </View>
      );
    };

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        animationConfigs={animationConfigs}
        stackBehavior="push"
        enableDynamicSizing={false}
        onChange={(index: number) => {
          if (index === -1) {
            setSelectedCollection(null);
          }
        }}
        backgroundComponent={renderBackground}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4 border-b border-border-secondary">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-text-primary" numberOfLines={1}>
                {selectedCollection?.token.name ||
                  t('nft.collection', { defaultValue: 'Collection' })}
              </Text>
              <Text className="text-sm text-text-secondary mt-1">
                {selectedCollection?.amount}{' '}
                {parseInt(selectedCollection?.amount || '0', 10) === 1
                  ? t('nft.item', { defaultValue: 'item' })
                  : t('nft.items', { defaultValue: 'items' })}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} className="ml-4">
              <Text className="text-2xl text-text-primary">✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Loading State */}
          {isLoading && instances.length === 0 && (
            <View className="items-center py-10">
              <ActivityIndicator size="large" />
              <Text className="text-text-secondary text-sm mt-4">
                {t('nft.loadingInstances', { defaultValue: 'Loading NFTs...' })}
              </Text>
            </View>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <View className="items-center py-10">
              <Text className="text-system-error text-base mb-4 text-center">
                {error.message ||
                  t('nft.errorLoadingInstances', { defaultValue: 'Error loading NFTs' })}
              </Text>
              <TouchableOpacity className="bg-brand-primary px-6 py-3 rounded-lg" onPress={refetch}>
                <Text className="text-white font-medium">
                  {t('nft.retry', { defaultValue: 'Retry' })}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !error && instances.length === 0 && (
            <View className="items-center py-10">
              <Text className="text-text-secondary text-base">
                {t('nft.noInstances', { defaultValue: 'No NFTs found' })}
              </Text>
            </View>
          )}

          {/* NFT Instances Grid */}
          {instances.length > 0 && (
            <View className="flex-row flex-wrap gap-3">
              {instances.map((instance, index) => (
                <View key={`${instance.id}-${index}`} style={{ width: '48%' }}>
                  {renderNFTInstance(instance, index)}
                </View>
              ))}
            </View>
          )}

          {/* Load More Button */}
          {hasNextPage && !isLoading && (
            <TouchableOpacity
              className="bg-background-secondary px-6 py-3 rounded-lg mt-4 items-center"
              onPress={handleLoadMore}
            >
              <Text className="text-text-primary font-medium">
                {t('nft.loadMore', { defaultValue: 'Load More' })}
              </Text>
            </TouchableOpacity>
          )}

          {/* Loading More Indicator */}
          {isLoading && instances.length > 0 && (
            <View className="items-center py-4">
              <ActivityIndicator size="small" />
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

export default NFTInstanceDialog;
