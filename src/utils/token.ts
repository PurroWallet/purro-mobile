import { NetworkLogos } from '@/assets';
import type { ChainTokenData } from '@/core/apis/alchemy/types';

/**
 * Get token logo from address using Alchemy or other API
 * This is a placeholder - implement based on your existing API integration
 */
const getTokenLogoFromAddress = async (
  networkId: ChainTokenData['chain'],
  tokenAddress: string,
): Promise<string | null> => {
  // TODO: Implement this based on your existing API service
  // For now, return null as fallback
  return null;
};

/**
 * Get token logo by symbol, network, or address
 * @param symbol - Token symbol (e.g., 'ETH', 'USDC', 'HYPE')
 * @param networkId - Optional chain type for address-based lookup
 * @param tokenAddress - Optional token contract address
 * @returns Token logo URL or local asset, null if not found
 */
export const getTokenLogo = async (
  symbol: string,
  networkId?: ChainTokenData['chain'],
  tokenAddress?: string,
): Promise<string | null> => {
  switch (symbol.toLowerCase()) {
    case 'eth':
      return NetworkLogos.ethereum;
    case 'weth':
      return NetworkLogos.ethereum;
    case 'usdc':
      return 'https://app.hyperliquid.xyz/coins/USDC.svg';
    case 'hype':
      return NetworkLogos.hyperliquid;
    case 'arb':
      return NetworkLogos.arbitrum;
    case 'base':
      return NetworkLogos.base;
    default: {
      if (networkId && tokenAddress) {
        const tokenLogo = await getTokenLogoFromAddress(networkId, tokenAddress);
        return tokenLogo;
      }
      return null;
    }
  }
};
