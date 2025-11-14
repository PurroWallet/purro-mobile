/**
 * Token Metadata Cache
 * Caches token metadata (name, symbol, decimals, logo) to reduce API calls
 * Uses MMKV for fast key-value storage
 */

import { MMKV } from 'react-native-mmkv';
import type { TokenMetadata } from '../apis/alchemy/types';

const TOKEN_METADATA_STORAGE_ID = 'purro_token_metadata';

/**
 * Cache statistics for debugging
 */
export interface CacheStats {
  totalKeys: number;
  keysByChain: Record<string, number>;
}

/**
 * Token Metadata Cache Service
 * Provides caching functionality for token metadata across different chains
 */
class TokenMetadataCache {
  private mmkv: MMKV;

  constructor() {
    this.mmkv = new MMKV({
      id: TOKEN_METADATA_STORAGE_ID,
      // No encryption needed for public token metadata
    });
  }

  /**
   * Generate cache key for token metadata
   * Format: token_metadata_{chainId}_{contractAddress}
   */
  private generateCacheKey(chainId: string, contractAddress: string): string {
    return `token_metadata_${chainId}_${contractAddress.toLowerCase()}`;
  }

  /**
   * Get cached metadata for a single token
   * @param chainId - Chain identifier (e.g., 'ethereum', 'base', 'arbitrum')
   * @param contractAddress - Token contract address
   * @returns Token metadata or null if not cached
   */
  getCachedMetadata(chainId: string, contractAddress: string): TokenMetadata | null {
    try {
      const key = this.generateCacheKey(chainId, contractAddress);
      const data = this.mmkv.getString(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as TokenMetadata;
    } catch (error) {
      console.error('Failed to get cached metadata:', error);
      return null;
    }
  }

  /**
   * Get cached metadata for multiple tokens
   * @param chainId - Chain identifier
   * @param addresses - Array of token contract addresses
   * @returns Record mapping contract addresses to their metadata
   */
  getMultipleCachedMetadata(chainId: string, addresses: string[]): Record<string, TokenMetadata> {
    const result: Record<string, TokenMetadata> = {};

    for (const address of addresses) {
      const metadata = this.getCachedMetadata(chainId, address);
      if (metadata) {
        result[address.toLowerCase()] = metadata;
      }
    }

    return result;
  }

  /**
   * Cache metadata for a single token
   * @param chainId - Chain identifier
   * @param contractAddress - Token contract address
   * @param metadata - Token metadata to cache
   */
  cacheMetadata(chainId: string, contractAddress: string, metadata: TokenMetadata): void {
    try {
      const key = this.generateCacheKey(chainId, contractAddress);
      this.mmkv.set(key, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to cache metadata:', error);
      throw error;
    }
  }

  /**
   * Cache metadata for multiple tokens
   * @param chainId - Chain identifier
   * @param metadata - Record mapping contract addresses to their metadata
   */
  cacheMultipleMetadata(chainId: string, metadata: Record<string, TokenMetadata>): void {
    try {
      for (const [address, tokenMetadata] of Object.entries(metadata)) {
        this.cacheMetadata(chainId, address, tokenMetadata);
      }
    } catch (error) {
      console.error('Failed to cache multiple metadata:', error);
      throw error;
    }
  }

  /**
   * Clear cache for a specific chain
   * @param chainId - Chain identifier to clear cache for
   */
  clearChainCache(chainId: string): void {
    try {
      const allKeys = this.mmkv.getAllKeys();
      const prefix = `token_metadata_${chainId}_`;

      const keysToDelete = allKeys.filter((key) => key.startsWith(prefix));

      for (const key of keysToDelete) {
        this.mmkv.delete(key);
      }
    } catch (error) {
      console.error('Failed to clear chain cache:', error);
      throw error;
    }
  }

  /**
   * Clear all cached token metadata
   */
  clearAllCache(): void {
    try {
      this.mmkv.clearAll();
    } catch (error) {
      console.error('Failed to clear all cache:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics for debugging
   * @returns Cache statistics including total keys and breakdown by chain
   */
  getCacheStats(): CacheStats {
    try {
      const allKeys = this.mmkv.getAllKeys();
      const stats: CacheStats = {
        totalKeys: allKeys.length,
        keysByChain: {},
      };

      // Count keys by chain
      for (const key of allKeys) {
        // Extract chain from key format: token_metadata_{chainId}_{address}
        const match = key.match(/^token_metadata_([^_]+)_/);
        if (match) {
          const chainId = match[1];
          stats.keysByChain[chainId] = (stats.keysByChain[chainId] || 0) + 1;
        }
      }

      return stats;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        totalKeys: 0,
        keysByChain: {},
      };
    }
  }
}

// Export singleton instance
export const tokenMetadataCache = new TokenMetadataCache();

// Export class for testing
export { TokenMetadataCache };
