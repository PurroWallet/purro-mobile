import { ethers } from 'ethers';
import {
  API_ENDPOINTS,
  COMMON_TOKENS,
  ENDPOINTS_TOKEN,
  type NetworkType,
} from '@/constants/networks';
import { networkProviderService } from './NetworkProviderService';

/**
 * ERC20 Token ABI (minimal interface for balance and transfer)
 */
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string; // Human-readable balance
  balanceRaw: string; // Raw balance in wei/smallest unit
  usdPrice: number;
  usdValue: number;
  logoUrl?: string;
}

export interface TokenPriceData {
  [symbol: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

/**
 * Token Service
 * Manages ERC20 token balances, prices, and metadata
 */
export class TokenService {
  private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
  private readonly PRICE_CACHE_TTL = 60000; // 1 minute cache

  /**
   * Get native token (ETH) balance
   */
  async getNativeBalance(
    address: string,
    networkType?: NetworkType,
  ): Promise<{
    balance: string;
    balanceRaw: string;
    usdPrice: number;
    usdValue: number;
  }> {
    try {
      const provider = networkProviderService.getProvider(networkType);
      const balanceRaw = await provider.getBalance(address);
      const balance = ethers.utils.formatEther(balanceRaw);

      // Get ETH price
      const usdPrice = await this.getTokenPrice('ethereum');
      const usdValue = parseFloat(balance) * usdPrice;

      return {
        balance,
        balanceRaw: balanceRaw.toString(),
        usdPrice,
        usdValue,
      };
    } catch (error) {
      console.error('Failed to get native balance:', error);
      throw error;
    }
  }

  /**
   * Get ERC20 token balance
   */
  async getERC20Balance(
    tokenAddress: string,
    walletAddress: string,
    networkType?: NetworkType,
  ): Promise<TokenInfo> {
    try {
      const provider = networkProviderService.getProvider(networkType);
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

      // Fetch token data in parallel
      const [balanceRaw, decimals, symbol, name] = await Promise.all([
        contract.balanceOf(walletAddress) as Promise<ethers.BigNumber>,
        contract.decimals() as Promise<number>,
        contract.symbol() as Promise<string>,
        contract.name() as Promise<string>,
      ]);

      const balance = ethers.utils.formatUnits(balanceRaw, decimals);

      // Get token price from CoinGecko
      const usdPrice = await this.getTokenPriceByAddress(tokenAddress);
      const usdValue = parseFloat(balance) * usdPrice;

      return {
        address: tokenAddress,
        name,
        symbol,
        decimals,
        balance,
        balanceRaw: balanceRaw.toString(),
        usdPrice,
        usdValue,
      };
    } catch (error) {
      console.error(`Failed to get ERC20 balance for ${tokenAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get all token balances for a wallet (native + common ERC20s)
   */
  async getAllTokenBalances(
    walletAddress: string,
    networkType?: NetworkType,
    customTokens: string[] = [],
  ): Promise<TokenInfo[]> {
    try {
      const tokens: TokenInfo[] = [];

      // Get native token (ETH) balance
      const nativeBalance = await this.getNativeBalance(walletAddress, networkType);
      const networkConfig = networkProviderService.getNetworkConfig(networkType);

      tokens.push({
        address: 'native',
        name: networkConfig.nativeCurrency.name,
        symbol: networkConfig.nativeCurrency.symbol,
        decimals: networkConfig.nativeCurrency.decimals,
        balance: nativeBalance.balance,
        balanceRaw: nativeBalance.balanceRaw,
        usdPrice: nativeBalance.usdPrice,
        usdValue: nativeBalance.usdValue,
      });

      // Get common ERC20 token balances
      const tokenAddresses = [...Object.values(COMMON_TOKENS), ...customTokens];

      const tokenBalances = await Promise.allSettled(
        tokenAddresses.map((address) => this.getERC20Balance(address, walletAddress, networkType)),
      );

      for (const result of tokenBalances) {
        if (result.status === 'fulfilled') {
          // Only include tokens with non-zero balance
          if (parseFloat(result.value.balance) > 0) {
            tokens.push(result.value);
          }
        }
      }

      return tokens;
    } catch (error) {
      console.error('Failed to get all token balances:', error);
      throw error;
    }
  }

  /**
   * Get token price from CoinGecko by token ID
   */
  async getTokenPrice(tokenId: string): Promise<number> {
    try {
      // Check cache first
      const cached = this.priceCache.get(tokenId);
      if (cached && Date.now() - cached.timestamp < this.PRICE_CACHE_TTL) {
        return cached.price;
      }

      const response = await fetch(
        `${API_ENDPOINTS.COINGECKO_API}/simple/price?ids=${tokenId}&vs_currencies=usd`,
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const price = data[tokenId]?.usd || 0;

      // Cache the price
      this.priceCache.set(tokenId, { price, timestamp: Date.now() });

      return price;
    } catch (error) {
      console.error(`Failed to get price for ${tokenId}:`, error);
      return 0; // Return 0 if price fetch fails
    }
  }

  /**
   * Get token price by contract address
   */
  async getTokenPriceByAddress(tokenAddress: string): Promise<number> {
    try {
      // Check cache first
      const cached = this.priceCache.get(tokenAddress);
      if (cached && Date.now() - cached.timestamp < this.PRICE_CACHE_TTL) {
        return cached.price;
      }

      const response = await fetch(
        `${API_ENDPOINTS.COINGECKO_API}/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=usd`,
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const price = data[tokenAddress.toLowerCase()]?.usd || 0;

      // Cache the price
      this.priceCache.set(tokenAddress, { price, timestamp: Date.now() });

      return price;
    } catch (error) {
      console.error(`Failed to get price for address ${tokenAddress}:`, error);
      return 0;
    }
  }

  /**
   * Get multiple token prices at once
   */
  async getMultipleTokenPrices(tokenIds: string[]): Promise<TokenPriceData> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.COINGECKO_API}/simple/price?ids=${tokenIds.join(',')}&vs_currencies=usd&include_24hr_change=true`,
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();

      // Cache all prices
      for (const [tokenId, priceData] of Object.entries(data)) {
        const price = (priceData as any).usd || 0;
        this.priceCache.set(tokenId, { price, timestamp: Date.now() });
      }

      return data;
    } catch (error) {
      console.error('Failed to get multiple token prices:', error);
      return {};
    }
  }

  /**
   * Search for token by address or symbol
   */
  async searchToken(query: string, networkType?: NetworkType): Promise<TokenInfo | null> {
    try {
      // Check if query is a valid Ethereum address
      if (ethers.utils.isAddress(query)) {
        const provider = networkProviderService.getProvider(networkType);
        const contract = new ethers.Contract(query, ERC20_ABI, provider);

        const [decimals, symbol, name] = await Promise.all([
          contract.decimals() as Promise<number>,
          contract.symbol() as Promise<string>,
          contract.name() as Promise<string>,
        ]);

        const usdPrice = await this.getTokenPriceByAddress(query);

        return {
          address: query,
          name,
          symbol,
          decimals,
          balance: '0',
          balanceRaw: '0',
          usdPrice,
          usdValue: 0,
        };
      }

      // If not an address, could implement symbol search via token list API
      console.log('Symbol search not implemented yet');
      return null;
    } catch (error) {
      console.error('Failed to search token:', error);
      return null;
    }
  }

  /**
   * Format token amount for display
   */
  formatTokenAmount(amount: string, decimals: number = 18): string {
    try {
      const formatted = ethers.utils.formatUnits(amount, decimals);
      const num = parseFloat(formatted);

      if (num === 0) return '0';
      if (num < 0.0001) return '<0.0001';
      if (num < 1) return num.toFixed(4);
      if (num < 1000) return num.toFixed(2);
      if (num < 1000000) return `${(num / 1000).toFixed(2)}K`;
      return `${(num / 1000000).toFixed(2)}M`;
    } catch (error) {
      console.error('Failed to format token amount:', error);
      return '0';
    }
  }

  /**
   * Parse token amount to raw units (wei/smallest unit)
   */
  parseTokenAmount(amount: string, decimals: number = 18): string {
    try {
      return ethers.utils.parseUnits(amount, decimals).toString();
    } catch (error) {
      console.error('Failed to parse token amount:', error);
      throw new Error('Invalid token amount');
    }
  }

  /**
   * Check if address has sufficient token balance
   */
  async hasSufficientBalance(
    walletAddress: string,
    tokenAddress: string,
    requiredAmount: string,
    decimals: number = 18,
    networkType?: NetworkType,
  ): Promise<boolean> {
    try {
      if (tokenAddress === 'native') {
        const balance = await networkProviderService.getBalance(walletAddress, networkType);
        const required = ethers.utils.parseUnits(requiredAmount, decimals);
        return balance.gte(required);
      }

      const provider = networkProviderService.getProvider(networkType);
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await contract.balanceOf(walletAddress);
      const required = ethers.utils.parseUnits(requiredAmount, decimals);

      return balance.gte(required);
    } catch (error) {
      console.error('Failed to check balance:', error);
      return false;
    }
  }

  /**
   * Fetch tokens from Hyperliquid API
   */
  async fetchTokens(request: FetchRequest) {
    try {
      const { network, search = '', page = 1, limit = 20 } = request;

      const response = await fetch(
        `${ENDPOINTS_TOKEN.LIQUID_SWAP}/tokens?network=${network}&search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
      );

      if (!response.ok) {
        throw new Error(`Hyperliquid API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        tokens: data.tokens || [],
        total: data.total || 0,
        page: data.page || page,
        hasMore: data.hasMore || false,
      };
    } catch (error) {
      console.error('Failed to fetch tokens from Hyperliquid:', error);
    }
  }

  /**
   * Clear price cache
   */
  clearPriceCache(): void {
    this.priceCache.clear();
  }
}

// Types for fetchTokens
export interface FetchRequest {
  network: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TokenData {
  id: string;
  symbol: string;
  name: string;
  icon?: string;
  verified: boolean;
  transfers24h: number;
  address?: string;
  decimals?: number;
  price?: number;
}

export interface TokenListResponse {
  tokens: TokenData[];
  total: number;
  page: number;
  hasMore: boolean;
}

// Create and export singleton instance
export const tokenService = new TokenService();
