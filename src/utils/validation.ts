import { ethers } from 'ethers';

/**
 * Address Validation Utilities
 */

/**
 * Validate Ethereum address (EIP-55 checksum)
 */
export function validateEthereumAddress(address: string): boolean {
  try {
    return ethers.utils.isAddress(address);
  } catch (error) {
    return false;
  }
}

/**
 * Validate and format Ethereum address with checksum
 */
export function formatEthereumAddress(address: string): string | null {
  try {
    if (!ethers.utils.isAddress(address)) {
      return null;
    }
    return ethers.utils.getAddress(address); // Returns checksummed address
  } catch (error) {
    return null;
  }
}

/**
 * Validate ENS name format
 */
export function validateENSName(name: string): boolean {
  // Basic ENS validation: must end with .eth and contain valid characters
  const ensRegex = /^[a-z0-9-]+\.eth$/i;
  return ensRegex.test(name);
}

/**
 * Validate transaction amount
 */
export function validateAmount(amount: string, maxDecimals: number = 18): boolean {
  try {
    if (!amount || amount === '') return false;

    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return false;

    // Check decimal places
    const parts = amount.split('.');
    if (parts.length > 2) return false;
    if (parts.length === 2 && parts[1].length > maxDecimals) return false;

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate gas price (in gwei)
 */
export function validateGasPrice(gasPrice: string): boolean {
  try {
    const num = parseFloat(gasPrice);
    return !isNaN(num) && num > 0 && num < 1000000; // Reasonable gas price limit
  } catch (error) {
    return false;
  }
}

/**
 * Validate transaction hash
 */
export function validateTransactionHash(hash: string): boolean {
  return /^0x([A-Fa-f0-9]{64})$/.test(hash);
}

/**
 * Sanitize address input (remove whitespace, convert to lowercase)
 */
export function sanitizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

/**
 * Format address for display (0x1234...5678)
 */
export function formatAddressForDisplay(
  address: string,
  startChars: number = 6,
  endChars: number = 4,
): string {
  if (!validateEthereumAddress(address)) return address;

  if (address.length <= startChars + endChars) return address;

  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
}

/**
 * Parse and validate numeric input
 */
export function parseNumericInput(input: string): string {
  // Remove all non-numeric characters except decimal point
  let cleaned = input.replace(/[^0-9.]/g, '');

  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  return cleaned;
}

/**
 * Validate token contract address
 */
export function validateTokenAddress(address: string): boolean {
  if (address === 'native' || address === 'eth') return true;
  return validateEthereumAddress(address);
}

/**
 * Check if string is a valid hex string
 */
export function isHexString(value: string): boolean {
  return /^0x[0-9A-Fa-f]*$/.test(value);
}

/**
 * Validate private key format
 */
export function validatePrivateKey(privateKey: string): boolean {
  try {
    // Remove 0x prefix if present
    const key = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

    // Must be 64 hex characters (32 bytes)
    if (!/^0x[0-9A-Fa-f]{64}$/.test(key)) return false;

    // Try to create wallet from private key
    new ethers.Wallet(key);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate mnemonic phrase
 */
export function validateMnemonic(mnemonic: string): boolean {
  try {
    return ethers.utils.isValidMnemonic(mnemonic);
  } catch (error) {
    return false;
  }
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate chain ID
 */
export function validateChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}
