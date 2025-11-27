import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { httpClient } from '@/core/apis/httpClient';

/**
 * Token ID mapping for Coinpaprika API
 * Wrapped tokens (WETH, WBTC) automatically use their native token's icon
 */
const TOKEN_ID_MAP: Record<string, string> = {
  ETH: 'eth-ethereum',
  WETH: 'eth-ethereum', // Wrapped ETH uses ETH icon
  BTC: 'btc-bitcoin',
  WBTC: 'btc-bitcoin', // Wrapped BTC uses BTC icon
  HYPE: 'hype-hyperliquid',
  USDC: 'usdc-usd-coin',
  USDT: 'usdt-tether',
  ARB: 'arb-arbitrum',
  BASE: 'base-base',
};

/**
 * Get Coinpaprika logo URL
 */
const getCoinpaprikaLogo = (coinId: string, size: 'small' | 'large' = 'small') => {
  return `https://static.coinpaprika.com/coin/${coinId}/logo.png`;
};

/**
 * Token market data from Coinpaprika /tickers API
 */
export interface CoinpaprikaTickerData {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  beta_value: number;
  quotes: {
    USD: {
      price: number;
      volume_24h: number;
      volume_24h_change_24h: number;
      market_cap: number;
      market_cap_change_24h: number;
      percent_change_15m: number;
      percent_change_30m: number;
      percent_change_1h: number;
      percent_change_6h: number;
      percent_change_12h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      percent_change_30d: number;
      percent_change_1y: number;
      ath_price: number;
      ath_date: string;
      percent_from_price_ath: number;
    };
  };
}

/**
 * Simplified token info
 */
export interface TokenInfo {
  price: number;
  logo: string;
  name: string;
  symbol: string;
  priceChange24h?: number;
  marketCap?: number;
}

/**
 * Fetch ALL tokens market data from Coinpaprika in a single call
 * This is called once and cached by React Query
 */
const fetchAllTokensMarketData = async (): Promise<Record<string, TokenInfo>> => {
  const response = await httpClient.get<CoinpaprikaTickerData[]>(
    'https://api.coinpaprika.com/v1/tickers',
  );

  // Build a map: tokenId -> TokenInfo
  const result: Record<string, TokenInfo> = {};

  // Get all token IDs we care about
  const relevantTokenIds = new Set(Object.values(TOKEN_ID_MAP));

  for (const data of response.data) {
    // Only process tokens we have in our mapping
    if (relevantTokenIds.has(data.id)) {
      result[data.id] = {
        price: data.quotes.USD.price || 0,
        logo: getCoinpaprikaLogo(data.id),
        name: data.name || '',
        symbol: data.symbol || '',
        priceChange24h: data.quotes.USD.percent_change_24h,
        marketCap: data.quotes.USD.market_cap,
      };
    }
  }

  return result;
};

/**
 * Hook to fetch ALL tokens market data once and cache it
 * Other hooks will filter from this cached data
 */
export const useAllTokensMarketData = (options?: { staleTime?: number; enabled?: boolean }) => {
  const query = useQuery({
    queryKey: ['allTokensMarketData'],
    queryFn: fetchAllTokensMarketData,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    enabled: options?.enabled ?? true,
  });

  return {
    allTokens: query.data ?? {},
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};

/**
 * Hook to get a single token's market data from the cached all-tokens data
 * @param symbol - Token symbol (e.g., 'ETH', 'HYPE')
 * @returns Token info with price, logo, name, and loading/error states
 */
export const useTokenMarketData = (
  symbol: string,
  options?: {
    staleTime?: number;
    enabled?: boolean;
  },
) => {
  const { allTokens, loading, error, refetch } = useAllTokensMarketData(options);

  // Filter the specific token from cached data
  const tokenInfo = useMemo(() => {
    const tokenId = TOKEN_ID_MAP[symbol.toUpperCase()];
    if (!tokenId || !allTokens[tokenId]) {
      return null;
    }
    return allTokens[tokenId];
  }, [symbol, allTokens]);

  return {
    tokenInfo,
    price: tokenInfo?.price ?? 0,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to get multiple tokens market data from the cached all-tokens data
 * @param symbols - Array of token symbols
 * @returns Object with tokens data, loading state, and error
 */
export const useMultipleTokenMarketData = (
  symbols: string[],
  options?: {
    staleTime?: number;
    enabled?: boolean;
  },
) => {
  const { allTokens, loading, error, refetch } = useAllTokensMarketData(options);

  // Filter requested tokens from cached data
  const tokens = useMemo(() => {
    const result: Record<string, TokenInfo> = {};

    for (const symbol of symbols) {
      const tokenId = TOKEN_ID_MAP[symbol.toUpperCase()];
      if (tokenId && allTokens[tokenId]) {
        result[symbol] = allTokens[tokenId];
      }
    }

    return result;
  }, [symbols, allTokens]);

  return {
    tokens,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to calculate USD value for a token balance
 * @param symbol - Token symbol
 * @param balance - Token balance (human-readable)
 * @returns USD value, price, and loading/error states
 */
export const useTokenValue = (symbol: string, balance: number) => {
  const { price, loading, error, tokenInfo } = useTokenMarketData(symbol);
  const usdValue = balance * price;

  return {
    usdValue,
    price,
    loading,
    error,
    tokenInfo,
  };
};

/**
 * Add custom token ID mapping
 * @param symbol - Token symbol
 * @param coinpaprikaId - Coinpaprika token ID (e.g., 'eth-ethereum')
 */
export const addTokenIdMapping = (symbol: string, coinpaprikaId: string): void => {
  TOKEN_ID_MAP[symbol.toUpperCase()] = coinpaprikaId;
};
