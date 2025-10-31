/**
 * Wallet Address Storage - Stores public wallet addresses locally
 * This allows instant wallet loading without deriving from seed phrase
 */

import { MMKV } from 'react-native-mmkv';

const ADDRESSES_STORAGE_ID = 'purro_wallet_addresses';
const ADDRESSES_KEY = 'wallet_addresses';

interface WalletAddress {
  address: string;
  type: 'HD' | 'Simple';
  brandName: string;
  alianName?: string;
  index?: number; // For HD wallets, account index
  createdAt: number;
}

class WalletAddressStorage {
  private mmkv: MMKV;

  constructor() {
    this.mmkv = new MMKV({
      id: ADDRESSES_STORAGE_ID,
      // No encryption needed for public addresses
    });
  }

  /**
   * Save wallet addresses to storage
   */
  saveAddresses(addresses: WalletAddress[]): void {
    try {
      this.mmkv.set(ADDRESSES_KEY, JSON.stringify(addresses));
    } catch (error) {
      console.error('Failed to save wallet addresses:', error);
      throw error;
    }
  }

  /**
   * Get all wallet addresses from storage
   */
  getAddresses(): WalletAddress[] {
    try {
      const data = this.mmkv.getString(ADDRESSES_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Failed to load wallet addresses:', error);
      return [];
    }
  }

  /**
   * Add a new wallet address
   */
  addAddress(address: WalletAddress): void {
    const addresses = this.getAddresses();
    addresses.push(address);
    this.saveAddresses(addresses);
  }

  /**
   * Add multiple wallet addresses
   */
  addAddresses(newAddresses: WalletAddress[]): void {
    const existingAddresses = this.getAddresses();

    // Filter out duplicates
    const existingAddressSet = new Set(existingAddresses.map((addr) => addr.address.toLowerCase()));
    const uniqueNewAddresses = newAddresses.filter(
      (addr) => !existingAddressSet.has(addr.address.toLowerCase()),
    );

    const allAddresses = [...existingAddresses, ...uniqueNewAddresses];
    this.saveAddresses(allAddresses);
  }

  /**
   * Remove a wallet address
   */
  removeAddress(targetAddress: string): void {
    const addresses = this.getAddresses();
    const filtered = addresses.filter(
      (addr) => addr.address.toLowerCase() !== targetAddress.toLowerCase(),
    );
    this.saveAddresses(filtered);
  }

  /**
   * Update wallet address alias/name
   */
  updateAddress(targetAddress: string, updates: Partial<WalletAddress>): void {
    const addresses = this.getAddresses();
    const index = addresses.findIndex(
      (addr) => addr.address.toLowerCase() === targetAddress.toLowerCase(),
    );

    if (index !== -1) {
      addresses[index] = { ...addresses[index], ...updates };
      this.saveAddresses(addresses);
    }
  }

  /**
   * Clear all addresses
   */
  clearAll(): void {
    this.mmkv.delete(ADDRESSES_KEY);
  }

  /**
   * Get addresses by type
   */
  getAddressesByType(type: 'HD' | 'Simple'): WalletAddress[] {
    return this.getAddresses().filter((addr) => addr.type === type);
  }

  /**
   * Check if address exists
   */
  hasAddress(address: string): boolean {
    return this.getAddresses().some((addr) => addr.address.toLowerCase() === address.toLowerCase());
  }
}

// Export singleton instance
export const walletAddressStorage = new WalletAddressStorage();

// Export types
export type { WalletAddress };
