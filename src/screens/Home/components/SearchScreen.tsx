import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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
import { type TokenData, tokenService } from '@/core/services/TokenService';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadTokens(true);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const loadTokens = async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : page;

      const response = await tokenService.fetchTokens({
        network: 'hyperliquid',
        search: searchQuery,
        page: currentPage,
        limit: 20,
      });

      console.log('response', response);

      if (resetPage) {
        // setTokens(response.tokens);
        setPage(1);
      } else {
        // setTokens((prev) => [...prev, ...response.tokens]);
      }

      // setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadTokens(true);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      loadTokens();
    }
  };

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
            disabled={loading}
          >
            <Icon name="refresh-cw" size={20} />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-background-secondary rounded-xl px-4 py-3">
          <Icon name="search" size={20} className="mr-2" />
          <TextInput
            className="flex-1 text-text-primary text-base"
            placeholder="Search tokens…"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading && tokens.length === 0 ? (
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

          {tokens.length === 0 && !loading && (
            <View className="items-center justify-center py-20">
              <Text className="text-text-secondary text-base">No tokens found</Text>
            </View>
          )}

          {loading && tokens.length > 0 && (
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
