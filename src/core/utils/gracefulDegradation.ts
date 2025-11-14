/**
 * Graceful Degradation Utilities
 * Provides utilities for handling partial failures and displaying fallback data
 */

import type { ChainTokenData } from '../apis/alchemy/types';
import type { NFTCollection } from '../apis/hyperscan/types';

/**
 * Check if chain data has partial success
 * Returns true if at least one chain has data
 */
export function hasPartialTokenData(chainData: ChainTokenData[]): boolean {
  return chainData.some((chain) => chain.tokens.length > 0);
}

/**
 * Get successful chains from token data
 */
export function getSuccessfulChains(chainData: ChainTokenData[]): ChainTokenData[] {
  return chainData.filter((chain) => !chain.error && chain.tokens.length > 0);
}

/**
 * Get failed chains from token data
 */
export function getFailedChains(chainData: ChainTokenData[]): ChainTokenData[] {
  return chainData.filter((chain) => chain.error);
}

/**
 * Check if NFT data is available (even if partial)
 */
export function hasNFTData(collections: NFTCollection[]): boolean {
  return collections.length > 0;
}

/**
 * Filter out NFTs with missing metadata
 */
export function filterNFTsWithMetadata(collections: NFTCollection[]): NFTCollection[] {
  return collections.filter((collection) => {
    // Keep collections that have at least a name or symbol
    return collection.token.name || collection.token.symbol;
  });
}

/**
 * Get NFTs with fallback metadata
 */
export function getNFTsWithFallback(collections: NFTCollection[]): NFTCollection[] {
  return collections.map((collection) => ({
    ...collection,
    token: {
      ...collection.token,
      name: collection.token.name || 'Unknown Collection',
      symbol: collection.token.symbol || 'UNKNOWN',
    },
  }));
}

/**
 * Check if data is stale based on timestamp
 */
export function isDataStale(timestamp: number, freshnessWindow: number = 300000): boolean {
  const now = Date.now();
  return now - timestamp > freshnessWindow;
}

/**
 * Merge cached and fresh data, preferring fresh data
 */
export function mergeTokenData(
  cachedData: ChainTokenData[],
  freshData: ChainTokenData[],
): ChainTokenData[] {
  const mergedMap = new Map<string, ChainTokenData>();

  // Add cached data first
  cachedData.forEach((chain) => {
    mergedMap.set(chain.chain, chain);
  });

  // Override with fresh data
  freshData.forEach((chain) => {
    mergedMap.set(chain.chain, chain);
  });

  return Array.from(mergedMap.values());
}

/**
 * Get partial failure message
 */
export function getPartialFailureMessage(totalChains: number, failedChains: number): string {
  if (failedChains === 0) {
    return '';
  }

  if (failedChains === totalChains) {
    return 'Unable to load data from any chain';
  }

  return `Showing data from ${totalChains - failedChains} of ${totalChains} chains`;
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: any): boolean {
  // Network errors, timeouts, and rate limits are recoverable
  const recoverableTypes = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'RATE_LIMIT_ERROR',
    'SERVICE_UNAVAILABLE',
  ];

  if (error?.type && recoverableTypes.includes(error.type)) {
    return true;
  }

  // Check error message for common recoverable patterns
  const errorMessage = error?.message?.toLowerCase() || '';
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('unavailable')
  );
}

/**
 * Get fallback data strategy message
 */
export function getFallbackMessage(hasCache: boolean, isStale: boolean): string {
  if (hasCache && isStale) {
    return 'Showing cached data. Pull to refresh for latest.';
  }

  if (hasCache && !isStale) {
    return 'Using cached data';
  }

  return 'No data available';
}
