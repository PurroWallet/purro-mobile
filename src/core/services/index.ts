import { ContactBookService } from './ContactBookService';
import { EncryptionService } from './EncryptionService';
import { KeyringService } from './KeyringService';
import { LockService } from './LockService';
import { NetworkProviderService } from './NetworkProviderService';
import { TokenService } from './TokenService';
import { TransactionHistoryService } from './TransactionHistoryService';
import { TransactionService } from './TransactionService';
import { WalletService } from './WalletService';

export * from './ContactBookService';
export * from './EncryptionService';
export * from './KeyringService';
export * from './LockService';
export * from './NetworkProviderService';
export * from './TokenService';
export * from './TransactionHistoryService';
export * from './TransactionService';
export * from './WalletService';

export const keyringService = new KeyringService();
export const lockService = new LockService();
export const contactBookService = new ContactBookService();
export const encryptionService = new EncryptionService();

export const networkProviderService = new NetworkProviderService();
export const tokenService = new TokenService();
export const transactionHistoryService = new TransactionHistoryService();
export const transactionService = new TransactionService();

export const walletService = new WalletService(keyringService, lockService, contactBookService);
