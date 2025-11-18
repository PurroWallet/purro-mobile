/**
 * NFT Queries Tests
 * Tests for network mode switching and query key generation
 */

import type { InfiniteData } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { hyperscanService } from '@/core/apis/hyperscan/hyperscanService';
import type { NFTCollectionsResponse } from '@/core/apis/hyperscan/types';
import { nftQueryKeys, useNFTCollectionsQuery } from './nftQueries';

// Mock hyperscanService
jest.mock('@/core/apis/hyperscan/hyperscanService', () => ({
  hyperscanService: {
    setTestnetMode: jest.fn(),
    fetchNFTCollections: jest.fn(),
  },
}));

describe('nftQueryKeys', () => {
  it('should generate different keys for mainnet and testnet', () => {
    const address = '0x1234567890123456789012345678901234567890';

    const mainnetKey = nftQueryKeys.collections(address, false);
    const testnetKey = nftQueryKeys.collections(address, true);

    expect(mainnetKey).toEqual(['nfts', 'collections', address, false]);
    expect(testnetKey).toEqual(['nfts', 'collections', address, true]);
    expect(mainnetKey).not.toEqual(testnetKey);
  });

  it('should generate different keys for different addresses', () => {
    const address1 = '0x1234567890123456789012345678901234567890';
    const address2 = '0x0987654321098765432109876543210987654321';

    const key1 = nftQueryKeys.collections(address1, false);
    const key2 = nftQueryKeys.collections(address2, false);

    expect(key1).not.toEqual(key2);
  });
});

describe('useNFTCollectionsQuery - Network Switching', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    // Clear all mocks
    jest.clearAllMocks();

    // Setup default mock response
    const mockResponse: NFTCollectionsResponse = {
      items: [
        {
          token: {
            address: '0xabc',
            name: 'Test NFT',
            symbol: 'TNFT',
            type: 'ERC-721',
          },
          amount: '1',
          token_instances: [],
        },
      ],
      next_page_params: null,
    };

    (hyperscanService.fetchNFTCollections as jest.Mock).mockResolvedValue(mockResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it('should call hyperscanService.setTestnetMode with correct value for mainnet', async () => {
    const address = '0x1234567890123456789012345678901234567890';

    const { result } = renderHook(() => useNFTCollectionsQuery(address, false), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(hyperscanService.setTestnetMode).toHaveBeenCalledWith(false);
  });

  it('should call hyperscanService.setTestnetMode with correct value for testnet', async () => {
    const address = '0x1234567890123456789012345678901234567890';

    const { result } = renderHook(() => useNFTCollectionsQuery(address, true), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(hyperscanService.setTestnetMode).toHaveBeenCalledWith(true);
  });

  it('should trigger new query when isTestnet parameter changes', async () => {
    const address = '0x1234567890123456789012345678901234567890';

    // Start with mainnet
    const { result, rerender } = renderHook(
      ({ isTestnet }: { isTestnet: boolean }) => useNFTCollectionsQuery(address, isTestnet),
      {
        wrapper,
        initialProps: { isTestnet: false },
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify mainnet was called
    expect(hyperscanService.setTestnetMode).toHaveBeenCalledWith(false);
    const mainnetCallCount = (hyperscanService.fetchNFTCollections as jest.Mock).mock.calls.length;

    // Switch to testnet
    rerender({ isTestnet: true });

    await waitFor(() => {
      const testnetCallCount = (hyperscanService.fetchNFTCollections as jest.Mock).mock.calls
        .length;
      return testnetCallCount > mainnetCallCount;
    });

    // Verify testnet was called
    expect(hyperscanService.setTestnetMode).toHaveBeenCalledWith(true);
  });

  it('should cache mainnet and testnet data separately', async () => {
    const address = '0x1234567890123456789012345678901234567890';

    const mainnetResponse: NFTCollectionsResponse = {
      items: [
        {
          token: {
            address: '0xmainnet',
            name: 'Mainnet NFT',
            symbol: 'MNFT',
            type: 'ERC-721',
          },
          amount: '1',
          token_instances: [],
        },
      ],
      next_page_params: null,
    };

    const testnetResponse: NFTCollectionsResponse = {
      items: [
        {
          token: {
            address: '0xtestnet',
            name: 'Testnet NFT',
            symbol: 'TNFT',
            type: 'ERC-721',
          },
          amount: '1',
          token_instances: [],
        },
      ],
      next_page_params: null,
    };

    // Mock different responses for mainnet and testnet
    (hyperscanService.fetchNFTCollections as jest.Mock)
      .mockResolvedValueOnce(mainnetResponse)
      .mockResolvedValueOnce(testnetResponse);

    // Fetch mainnet data
    const { result: mainnetResult } = renderHook(() => useNFTCollectionsQuery(address, false), {
      wrapper,
    });

    await waitFor(() => expect(mainnetResult.current.isSuccess).toBe(true));

    // Fetch testnet data
    const { result: testnetResult } = renderHook(() => useNFTCollectionsQuery(address, true), {
      wrapper,
    });

    await waitFor(() => expect(testnetResult.current.isSuccess).toBe(true));

    // Verify both queries have different data
    const mainnetData = mainnetResult.current.data as
      | InfiniteData<NFTCollectionsResponse>
      | undefined;
    const testnetData = testnetResult.current.data as
      | InfiniteData<NFTCollectionsResponse>
      | undefined;
    expect(mainnetData?.pages?.[0]?.items[0]?.token.address).toBe('0xmainnet');
    expect(testnetData?.pages?.[0]?.items[0]?.token.address).toBe('0xtestnet');

    // Verify both are cached (fetchNFTCollections should have been called exactly twice)
    expect(hyperscanService.fetchNFTCollections).toHaveBeenCalledTimes(2);
  });

  it('should not fetch when address is empty', () => {
    const { result } = renderHook(() => useNFTCollectionsQuery('', false), {
      wrapper,
    });

    expect(result.current.status).toBe('pending');
    expect(result.current.fetchStatus).toBe('idle');
    expect(hyperscanService.fetchNFTCollections).not.toHaveBeenCalled();
  });
});
