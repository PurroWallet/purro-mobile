import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NFTCollectionList from './components/NFTCollectionList';
import NFTInstanceDialog from './components/NFTInstanceDialog';
import { useNFTScreen } from './hooks/useNFTScreen';

/**
 * NFTScreen Component
 * Main screen for displaying NFT collections
 * Integrates NFTCollectionList and NFTInstanceDialog components
 */
const NFTScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    collections,
    isLoading,
    error,
    hasNextPage,
    onLoadMore,
    onRefresh,
    onCollectionPress,
    currentAddress,
    nftInstanceDialogRef,
  } = useNFTScreen();

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 bg-primary">
          <Text className="text-3xl font-bold text-text-primary">{t('home.nav.nft')}</Text>
        </View>
        {/* NFT Collection List */}
        <NFTCollectionList
          collections={collections}
          isLoading={isLoading}
          error={error}
          hasNextPage={hasNextPage}
          onLoadMore={onLoadMore}
          onRefresh={onRefresh}
          onCollectionPress={onCollectionPress}
        />

        {/* NFT Instance Dialog */}
        <NFTInstanceDialog ref={nftInstanceDialogRef} holderAddress={currentAddress} />
      </View>
    </SafeAreaView>
  );
};

export default NFTScreen;
