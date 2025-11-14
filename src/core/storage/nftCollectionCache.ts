/**
 * NFT Collection Cache
 * Caches NFT collection data with 5-minute freshness window
 * Uses MMKV for fast key-value storage
 */

import { MMKV } from 'react-native-mmkv';
import type { NextPageParams, NFTCollectionsResponse } from '../apis/hyperscan/types';

const NFT_COLLECTION_STORAGE_ID = 'purro_nft_collections';
const FRESHNESS_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Cached NFT data with timestamp
 */
export interface CachedNFTData {
  data: NFTCollectionsResponse;
  timestamp: number;
}

/**
 * NFT Collection Cache Service
 * Provides caching functionality for NFT collections with time-based freshness
 */
class NFTCollectionCache {
  private mmkv: MMKV;

  constructor() {
    this.mmkv = new MMKV({
      id: NFT_COLLECTION_STORAGE_ID,
      // No encryption needed for public NFT data
    });
  }

  /**
   * Generate cache key for NFT collections
   * Format: nft_collections_{address}_{page}_{pageParamsHash}
   */
  private generateCacheKey(address: string, page: number, pageParams?: NextPageParams): string {
    const paramsHash = this.hashPageParams(pageParams);
    return `nft_collections_${address.toLowerCase()}_${page}_${paramsHash}`;
  }

  /**
   * Hash page parameters for cache key generation
   * Creates a consistent hash from page parameters
   */
  private hashPageParams(pageParams?: NextPageParams): string {
    if (!pageParams) {
      return 'initial';
    }

    // Create a deterministic string from page params
    const parts: string[] = [];

    if (pageParams.token_contract_address_hash) {
      parts.push(`addr:${pageParams.token_contract_address_hash}`);
    }
    if (pageParams.token_type) {
      parts.push(`type:${pageParams.token_type}`);
    }
    if (pageParams.items_count !== undefined) {
      parts.push(`count:${pageParams.items_count}`);
    }
    if (pageParams.token_id) {
      parts.push(`id:${pageParams.token_id}`);
    }

    return parts.length > 0 ? parts.join('_') : 'empty';
  }

  /**
   * Get cached NFT collections
   * @param address - Wallet address
   * @param page - Page number
   * @param pageParams - Pagination parameters
   * @returns Cached NFT data or null if not cached or stale
   */
  getCachedNFTs(address: string, page: number, pageParams?: NextPageParams): CachedNFTData | null {
    try {
      const key = this.generateCacheKey(address, page, pageParams);
      const data = this.mmkv.getString(key);

      if (!data) {
        return null;
      }

      const cachedData = JSON.parse(data) as CachedNFTData;

      // Check if data is still fresh
      if (!this.isDataFresh(cachedData.timestamp)) {
        return null;
      }

      return cachedData;
    } catch (error) {
      console.error('Failed to get cached NFTs:', error);
      return null;
    }
  }

  /**
   * Cache NFT collections
   * @param address - Wallet address
   * @param page - Page number
   * @param pageParams - Pagination parameters
   * @param data - NFT collections response to cache
   */
  setCachedNFTs(
    address: string,
    page: number,
    pageParams: NextPageParams | undefined,
    data: NFTCollectionsResponse,
  ): void {
    try {
      const key = this.generateCacheKey(address, page, pageParams);
      const cachedData: CachedNFTData = {
        data,
        timestamp: Date.now(),
      };

      this.mmkv.set(key, JSON.stringify(cachedData));
    } catch (error) {
      console.error('Failed to cache NFTs:', error);
      throw error;
    }
  }

  /**
   * Check if cached data is still fresh
   * @param timestamp - Timestamp when data was cached
   * @returns True if data is within freshness window (5 minutes)
   */
  isDataFresh(timestamp: number): boolean {
    const now = Date.now();
    const age = now - timestamp;
    return age < FRESHNESS_WINDOW_MS;
  }

  /**
   * Clear all cached NFT collections
   */
  clearCache(): void {
    try {
      this.mmkv.clearAll();
    } catch (error) {
      console.error('Failed to clear NFT cache:', error);
      throw error;
    }
  }

  /**
   * Clear cache for a specific address
   * @param address - Wallet address to clear cache for
   */
  clearAddressCache(address: string): void {
    try {
      const allKeys = this.mmkv.getAllKeys();
      const prefix = `nft_collections_${address.toLowerCase()}_`;

      const keysToDelete = allKeys.filter((key) => key.startsWith(prefix));

      for (const key of keysToDelete) {
        this.mmkv.delete(key);
      }
    } catch (error) {
      console.error('Failed to clear address cache:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics for debugging
   * @returns Total number of cached entries
   */
  getCacheStats(): { totalKeys: number } {
    try {
      const allKeys = this.mmkv.getAllKeys();
      return {
        totalKeys: allKeys.length,
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        totalKeys: 0,
      };
    }
  }
}

// Export singleton instance
export const nftCollectionCache = new NFTCollectionCache();

// Export class for testing
export { NFTCollectionCache };
