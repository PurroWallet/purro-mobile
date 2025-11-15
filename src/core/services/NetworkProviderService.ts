import { ethers } from 'ethers';
import {
  DEFAULT_NETWORK,
  NETWORKS,
  type NetworkConfig,
  type NetworkType,
} from '@/constants/networks';

/**
 * Network Provider Service
 * Manages Ethereum JSON-RPC connections with fallback support
 */
export class NetworkProviderService {
  private providers: Map<NetworkType, ethers.providers.JsonRpcProvider> = new Map();
  private currentNetwork: NetworkType = DEFAULT_NETWORK;

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize providers for enabled networks
   */
  private initializeProviders(): void {
    for (const [networkType, config] of Object.entries(NETWORKS)) {
      if (config.enabled) {
        this.createProvider(networkType as NetworkType, config);
      }
    }
  }

  /**
   * Create provider with fallback RPC URLs
   */
  private createProvider(networkType: NetworkType, config: NetworkConfig): void {
    try {
      // Use first available RPC URL (add Infura/Alchemy keys via env)
      const rpcUrl = this.getActiveRpcUrl(config.rpcUrls);

      const provider = new ethers.providers.JsonRpcProvider(
        {
          url: rpcUrl,
          timeout: 30000, // 30s timeout
        },
        {
          name: config.name,
          chainId: config.chainId,
        },
      );

      // Add event listeners for connection monitoring
      provider.on('error', (error) => {
        console.error(`Provider error for ${networkType}:`, error);
        this.handleProviderError(networkType, config);
      });

      this.providers.set(networkType, provider);
    } catch (error) {
      console.error(`Failed to initialize provider for ${networkType}:`, error);
    }
  }

  /**
   * Get active RPC URL (filter out placeholder keys)
   */
  private getActiveRpcUrl(rpcUrls: string[]): string {
    // Filter out URLs with placeholder keys
    const validUrls = rpcUrls.filter(
      (url) => !url.includes('YOUR_INFURA_KEY') && !url.includes('YOUR_ALCHEMY_KEY'),
    );

    if (validUrls.length === 0) {
      throw new Error('No valid RPC URLs available. Please configure Infura or Alchemy keys.');
    }

    return validUrls[0];
  }

  /**
   * Handle provider errors with fallback
   */
  private handleProviderError(networkType: NetworkType, config: NetworkConfig): void {
    // Try next RPC URL
    const rpcUrls = config.rpcUrls.filter(
      (url) => !url.includes('YOUR_INFURA_KEY') && !url.includes('YOUR_ALCHEMY_KEY'),
    );

    if (rpcUrls.length > 1) {
      const nextRpcUrl = rpcUrls[1];
      const provider = new ethers.providers.JsonRpcProvider(nextRpcUrl, {
        name: config.name,
        chainId: config.chainId,
      });
      this.providers.set(networkType, provider);
    }
  }

  /**
   * Get provider for specific network
   */
  getProvider(networkType: NetworkType = this.currentNetwork): ethers.providers.JsonRpcProvider {
    const provider = this.providers.get(networkType);

    if (!provider) {
      throw new Error(`Provider not found for network: ${networkType}`);
    }

    return provider;
  }

  /**
   * Get current network
   */
  getCurrentNetwork(): NetworkType {
    return this.currentNetwork;
  }

  /**
   * Switch to different network
   */
  setCurrentNetwork(networkType: NetworkType): void {
    const config = NETWORKS[networkType];

    if (!config.enabled) {
      throw new Error(`Network ${networkType} is not enabled`);
    }

    if (!this.providers.has(networkType)) {
      this.createProvider(networkType, config);
    }

    this.currentNetwork = networkType;
  }

  /**
   * Get network configuration
   */
  getNetworkConfig(networkType: NetworkType = this.currentNetwork): NetworkConfig {
    return NETWORKS[networkType];
  }

  /**
   * Get all enabled networks
   */
  getEnabledNetworks(): NetworkConfig[] {
    return Object.values(NETWORKS).filter((config) => config.enabled);
  }

  /**
   * Check if provider is connected
   */
  async isConnected(networkType: NetworkType = this.currentNetwork): Promise<boolean> {
    try {
      const provider = this.getProvider(networkType);
      const network = await provider.getNetwork();
      return network.chainId === NETWORKS[networkType].chainId;
    } catch (error) {
      console.error(`Failed to check connection for ${networkType}:`, error);
      return false;
    }
  }

  /**
   * Get current block number
   */
  async getBlockNumber(networkType: NetworkType = this.currentNetwork): Promise<number> {
    const provider = this.getProvider(networkType);
    return await provider.getBlockNumber();
  }

  /**
   * Get gas price
   */
  async getGasPrice(networkType: NetworkType = this.currentNetwork): Promise<ethers.BigNumber> {
    const provider = this.getProvider(networkType);
    return await provider.getGasPrice();
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(
    transaction: ethers.providers.TransactionRequest,
    networkType: NetworkType = this.currentNetwork,
  ): Promise<ethers.BigNumber> {
    const provider = this.getProvider(networkType);
    return await provider.estimateGas(transaction);
  }

  /**
   * Get balance for address
   */
  async getBalance(
    address: string,
    networkType: NetworkType = this.currentNetwork,
  ): Promise<ethers.BigNumber> {
    const provider = this.getProvider(networkType);
    return await provider.getBalance(address);
  }

  /**
   * Send raw transaction
   */
  async sendTransaction(
    signedTransaction: string,
    networkType: NetworkType = this.currentNetwork,
  ): Promise<ethers.providers.TransactionResponse> {
    const provider = this.getProvider(networkType);
    return await provider.sendTransaction(signedTransaction);
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    txHash: string,
    confirmations: number = 1,
    networkType: NetworkType = this.currentNetwork,
  ): Promise<ethers.providers.TransactionReceipt> {
    const provider = this.getProvider(networkType);
    return await provider.waitForTransaction(txHash, confirmations);
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(
    txHash: string,
    networkType: NetworkType = this.currentNetwork,
  ): Promise<ethers.providers.TransactionReceipt | null> {
    const provider = this.getProvider(networkType);
    return await provider.getTransactionReceipt(txHash);
  }

  /**
   * Cleanup providers
   */
  cleanup(): void {
    for (const [networkType, provider] of this.providers.entries()) {
      provider.removeAllListeners();
    }
    this.providers.clear();
  }
}

// Create and export singleton instance
export const networkProviderService = new NetworkProviderService();
