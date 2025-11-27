import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { useSearchScreen } from '../hooks/useSearchScreen';
import SearchTokenItem from './SearchTokenItem';

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
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <View
              key={index}
              className="flex-row items-center justify-between py-4 border-b border-border-secondary"
            >
              {/* Left side: Icon + Info */}
              <View className="flex-row items-center flex-1">
                {/* Icon skeleton */}
                <View className="w-12 h-12 rounded-full bg-background-secondary" />

                {/* Text info skeleton */}
                <View className="flex-1 ml-4">
                  <View className="flex-row items-center mb-2">
                    <View className="h-5 w-20 bg-background-secondary rounded" />
                  </View>
                  <View className="h-4 w-32 bg-background-secondary rounded" />
                </View>
              </View>

              {/* Right side: Stats skeleton */}
              <View className="items-end">
                <View className="h-5 w-16 bg-background-secondary rounded mb-2" />
                <View className="h-3 w-24 bg-background-secondary rounded" />
              </View>
            </View>
          ))}
        </ScrollView>
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
            <SearchTokenItem key={token.id} token={token} formatNumber={formatNumber} />
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
