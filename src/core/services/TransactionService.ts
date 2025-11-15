import { ethers } from 'ethers';
import { GAS_MULTIPLIERS, GAS_STRATEGY, GasStrategy, type NetworkType } from '@/constants/networks';
import { keyringService } from './KeyringService';
import { networkProviderService } from './NetworkProviderService';
import { tokenService } from './TokenService';
import { transactionHistoryService } from './TransactionHistoryService';

/**
 * ERC20 Transfer ABI
 */
const ERC20_TRANSFER_ABI = ['function transfer(address to, uint256 amount) returns (bool)'];

export interface TransactionParams {
  from: string;
  to: string;
  amount: string; // Human-readable amount (e.g., "1.5")
  tokenAddress?: string; // undefined for native ETH
  gasStrategy?: GasStrategy;
  networkType?: NetworkType;
  data?: string;
  nonce?: number;
}

export interface TransactionEstimate {
  gasLimit: string;
  gasPrice: string;
  gasFee: string; // In native currency (ETH)
  gasFeeUSD: number;
  total: string; // Amount + gas fee
  totalUSD: number;
}

export interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  amount: string;
  tokenAddress?: string;
  gasUsed?: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp: number;
}

/**
 * Transaction Service
 * Handles building, signing, and broadcasting Ethereum transactions
 */
export class TransactionService {
  /**
   * Send native ETH or ERC20 tokens
   */
  async sendTransaction(params: TransactionParams): Promise<TransactionResult> {
    try {
      // Validate addresses
      if (!ethers.utils.isAddress(params.from)) {
        throw new Error('Invalid sender address');
      }
      if (!ethers.utils.isAddress(params.to)) {
        throw new Error('Invalid recipient address');
      }

      // Build transaction
      const transaction = params.tokenAddress
        ? await this.buildERC20Transaction(params)
        : await this.buildNativeTransaction(params);

      // Estimate gas
      const provider = networkProviderService.getProvider(params.networkType);
      const gasLimit = await provider.estimateGas(transaction);

      // Apply gas strategy multiplier
      const gasStrategy = params.gasStrategy || GasStrategy.STANDARD;
      const gasPrice = await this.getGasPrice(gasStrategy, params.networkType);

      transaction.gasLimit = gasLimit;
      transaction.gasPrice = gasPrice;

      // Sign transaction
      const signedTx = await keyringService.signTransaction(params.from, transaction);

      // Broadcast transaction
      const txResponse = await provider.sendTransaction(signedTx);

      // Save to history
      const txResult: TransactionResult = {
        hash: txResponse.hash,
        from: params.from,
        to: params.to,
        amount: params.amount,
        tokenAddress: params.tokenAddress,
        status: 'pending',
        timestamp: Date.now(),
      };

      await transactionHistoryService.saveTransaction(txResult);

      // Wait for confirmation in background
      this.waitForConfirmation(txResponse.hash, params.networkType).catch((error) => {
        console.error('Failed to wait for confirmation:', error);
      });

      return txResult;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Build native ETH transaction
   */
  private async buildNativeTransaction(
    params: TransactionParams,
  ): Promise<ethers.providers.TransactionRequest> {
    const provider = networkProviderService.getProvider(params.networkType);
    const nonce = params.nonce ?? (await provider.getTransactionCount(params.from, 'latest'));

    return {
      from: params.from,
      to: params.to,
      value: ethers.utils.parseEther(params.amount),
      nonce,
      data: params.data || '0x',
    };
  }

  /**
   * Build ERC20 token transaction
   */
  private async buildERC20Transaction(
    params: TransactionParams,
  ): Promise<ethers.providers.TransactionRequest> {
    if (!params.tokenAddress) {
      throw new Error('Token address is required for ERC20 transfer');
    }

    const provider = networkProviderService.getProvider(params.networkType);
    const nonce = params.nonce ?? (await provider.getTransactionCount(params.from, 'latest'));

    // Get token contract interface
    const tokenContract = new ethers.utils.Interface(ERC20_TRANSFER_ABI);

    // Get token decimals
    const tokenInfo = await tokenService.getERC20Balance(
      params.tokenAddress,
      params.from,
      params.networkType,
    );

    // Encode transfer function call
    const data = tokenContract.encodeFunctionData('transfer', [
      params.to,
      ethers.utils.parseUnits(params.amount, tokenInfo.decimals),
    ]);

    return {
      from: params.from,
      to: params.tokenAddress, // Send to token contract
      value: ethers.BigNumber.from(0), // No ETH value for ERC20
      data,
      nonce,
    };
  }

  /**
   * Get gas price based on strategy
   */
  private async getGasPrice(
    strategy: GasStrategy,
    networkType?: NetworkType,
  ): Promise<ethers.BigNumber> {
    const provider = networkProviderService.getProvider(networkType);
    const baseGasPrice = await provider.getGasPrice();

    const multiplier = GAS_MULTIPLIERS[strategy];
    return baseGasPrice.mul(Math.floor(multiplier * 100)).div(100);
  }

  /**
   * Estimate transaction cost
   */
  async estimateTransactionCost(params: TransactionParams): Promise<TransactionEstimate> {
    try {
      // Build transaction
      const transaction = params.tokenAddress
        ? await this.buildERC20Transaction(params)
        : await this.buildNativeTransaction(params);

      // Estimate gas
      const provider = networkProviderService.getProvider(params.networkType);
      const gasLimit = await provider.estimateGas(transaction);

      // Get gas price
      const gasStrategy = params.gasStrategy || GasStrategy.STANDARD;
      const gasPrice = await this.getGasPrice(gasStrategy, params.networkType);

      // Calculate gas fee
      const gasFee = gasLimit.mul(gasPrice);
      const gasFeeEth = ethers.utils.formatEther(gasFee);

      // Get ETH price for USD calculation
      const ethPrice = await tokenService.getTokenPrice('ethereum');
      const gasFeeUSD = parseFloat(gasFeeEth) * ethPrice;

      // Calculate total (for native ETH only)
      let total = params.amount;
      let totalUSD = 0;

      if (!params.tokenAddress) {
        // Native ETH transfer
        const amountBN = ethers.utils.parseEther(params.amount);
        const totalBN = amountBN.add(gasFee);
        total = ethers.utils.formatEther(totalBN);
        totalUSD = parseFloat(total) * ethPrice;
      } else {
        // ERC20 transfer - only need gas fee
        const tokenPrice = await tokenService.getTokenPriceByAddress(params.tokenAddress);
        totalUSD = parseFloat(params.amount) * tokenPrice;
      }

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
        gasFee: gasFeeEth,
        gasFeeUSD,
        total,
        totalUSD,
      };
    } catch (error) {
      console.error('Failed to estimate transaction cost:', error);
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  private async waitForConfirmation(txHash: string, networkType?: NetworkType): Promise<void> {
    try {
      const provider = networkProviderService.getProvider(networkType);
      const receipt = await provider.waitForTransaction(txHash, 1);

      const status = receipt.status === 1 ? 'confirmed' : 'failed';

      // Update transaction history
      await transactionHistoryService.updateTransaction(txHash, {
        status,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      });
    } catch (error) {
      console.error('Failed to wait for confirmation:', error);

      // Mark as failed
      await transactionHistoryService.updateTransaction(txHash, {
        status: 'failed',
      });
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(
    txHash: string,
    networkType?: NetworkType,
  ): Promise<'pending' | 'confirmed' | 'failed'> {
    try {
      const provider = networkProviderService.getProvider(networkType);
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        return 'pending';
      }

      return receipt.status === 1 ? 'confirmed' : 'failed';
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return 'pending';
    }
  }

  /**
   * Cancel pending transaction (by replacing with higher gas)
   */
  async cancelTransaction(
    txHash: string,
    from: string,
    networkType?: NetworkType,
  ): Promise<TransactionResult> {
    try {
      const provider = networkProviderService.getProvider(networkType);
      const tx = await provider.getTransaction(txHash);

      if (!tx) {
        throw new Error('Transaction not found');
      }

      if (tx.blockNumber) {
        throw new Error('Transaction already confirmed');
      }

      // Create replacement transaction with higher gas
      const gasPrice = tx.gasPrice?.mul(120).div(100); // 20% higher

      const cancelTx: ethers.providers.TransactionRequest = {
        from,
        to: from, // Send to self
        value: ethers.BigNumber.from(0),
        nonce: tx.nonce,
        gasPrice,
        gasLimit: 21000, // Standard gas for ETH transfer
      };

      // Sign and broadcast
      const signedTx = await keyringService.signTransaction(from, cancelTx);
      const txResponse = await provider.sendTransaction(signedTx);

      return {
        hash: txResponse.hash,
        from,
        to: from,
        amount: '0',
        status: 'pending',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to cancel transaction:', error);
      throw error;
    }
  }

  /**
   * Speed up pending transaction (replace with higher gas)
   */
  async speedUpTransaction(
    txHash: string,
    from: string,
    networkType?: NetworkType,
  ): Promise<TransactionResult> {
    try {
      const provider = networkProviderService.getProvider(networkType);
      const tx = await provider.getTransaction(txHash);

      if (!tx) {
        throw new Error('Transaction not found');
      }

      if (tx.blockNumber) {
        throw new Error('Transaction already confirmed');
      }

      // Create replacement transaction with 50% higher gas
      const gasPrice = tx.gasPrice?.mul(150).div(100);

      const speedUpTx: ethers.providers.TransactionRequest = {
        from,
        to: tx.to,
        value: tx.value,
        data: tx.data,
        nonce: tx.nonce,
        gasPrice,
        gasLimit: tx.gasLimit,
      };

      // Sign and broadcast
      const signedTx = await keyringService.signTransaction(from, speedUpTx);
      const txResponse = await provider.sendTransaction(signedTx);

      return {
        hash: txResponse.hash,
        from,
        to: tx.to || '',
        amount: ethers.utils.formatEther(tx.value),
        status: 'pending',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to speed up transaction:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const transactionService = new TransactionService();
