import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  ActivityIndicator,
  Image as RNImage,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DefaultIcon from '@/assets/common/icon.png';
import { Icon } from '@/components/Icon';
import { useSearchScreen } from '../hooks/useSearchScreen';

const SearchScreen = () => {
  const navigation = useNavigation();
  const {
    searchQuery,
    setSearchQuery,
    tokens,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    handleRefresh,
    handleLoadMore,
    formatNumber,
  } = useSearchScreen();

  return (
    <SafeAreaView className="flex-1 bg-primary dark:bg-primary">
      <View className="px-6 pt-5 pb-4">
        <View className="flex-row items-center justify-between mb-5">
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            className="w-10 h-10 items-center justify-center"
          >
            <Icon name="x" size={24} />
          </TouchableOpacity>

          <Text className="text-text-primary text-2xl font-semibold flex-1 text-center">
            Tokens on HyperEVM
          </Text>

          <TouchableOpacity
            onPress={handleRefresh}
            className="w-10 h-10 items-center justify-center"
            disabled={isLoading}
          >
            <Icon name="refresh-cw" size={16} />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-background-secondary rounded-xl px-4 py-3">
          <Icon name="search" size={16} className="mr-2" />
          <TextInput
            className="flex-1 text-text-primary"
            placeholder="Search tokens…"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isLoading && tokens.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-text-secondary text-sm mt-4">Loading tokens...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
            if (isCloseToBottom) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {tokens.map((token) => (
            <TouchableOpacity
              key={token.id}
              className="flex-row items-center justify-between py-4 border-b border-border-secondary"
            >
              <View className="flex-row items-center flex-1">
                <RNImage
                  source={token.icon ? { uri: token.icon } : DefaultIcon}
                  className="w-12 h-12 rounded-full"
                  resizeMode="cover"
                />

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
          ))}

          {tokens.length === 0 && !isLoading && (
            <View className="items-center justify-center py-20">
              <Text className="text-text-secondary text-base">No tokens found</Text>
            </View>
          )}

          {isFetchingNextPage && (
            <View className="items-center justify-center py-4">
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;
