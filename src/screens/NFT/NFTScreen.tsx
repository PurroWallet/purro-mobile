import React from 'react';
import { View } from 'react-native';
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
