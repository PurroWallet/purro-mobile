import { KEYRING_CLASS } from '../keyring/types';
import { ContactBookService } from './ContactBookService';
import { KeyringService } from './KeyringService';
import { LockService } from './LockService';

/**
 * Wallet Service - High-level wallet operations
 * Based on Rabby's wallet service but optimized for mobile
 */
export class WalletService {
  private keyringService: KeyringService;
  private lockService: LockService;
  private contactBookService: ContactBookService;

  constructor(
    keyringService: KeyringService = new KeyringService(),
    lockService: LockService = new LockService(),
    contactBookService: ContactBookService = new ContactBookService(),
  ) {
    this.keyringService = keyringService;
    this.lockService = lockService;
    this.contactBookService = contactBookService;
  }

  /**
   * Check if wallet exists
   */
  hasWallet(): boolean {
    return this.keyringService.hasVault();
  }

  /**
   * Create new wallet with password - Optimized with parallel operations
   */
  async createWallet(password: string): Promise<{
    mnemonic: string;
    addresses: string[];
  }> {
    try {
      console.log('🏗️ WalletService.createWallet - Starting wallet creation...');
      console.log('🏗️ Password provided:', !!password);

      // Boot keyring service for new wallet creation (no vault verification)
      console.log('🏗️ Booting keyring service for new wallet...');
      await this.keyringService.bootForNewWallet(password);
      console.log('🏗️ Keyring service booted successfully');

      // Generate mnemonic and prepare alias in parallel
      console.log('🏗️ Generating mnemonic and alias...');
      const [mnemonic, alias] = await Promise.all([
        Promise.resolve(this.keyringService.generateMnemonic()),
        Promise.resolve(this.generateAliasName(KEYRING_CLASS.MNEMONIC, 0, 0)),
      ]);
      console.log('🏗️ Generated mnemonic length:', mnemonic.length);
      console.log('🏗️ Generated alias:', alias);

      // Create HD keyring with mnemonic
      console.log('🏗️ Creating HD keyring with mnemonic...');
      const addresses = await this.keyringService.createHDKeyring(mnemonic);
      console.log('🏗️ Created HD keyring with addresses:', addresses.length);

      // Store contact with alias
      await this.contactBookService.addContact({
        address: addresses[0],
        name: alias,
        isAlias: true,
        brandName: KEYRING_CLASS.MNEMONIC,
      });

      return { mnemonic, addresses };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Import wallet with mnemonic - Optimized with parallel operations
   */
  async importWalletWithMnemonic(
    mnemonic: string,
    password: string,
    passphrase?: string,
  ): Promise<string[]> {
    try {
      // Boot keyring service with password
      await this.keyringService.boot(password);

      // Create HD keyring and prepare alias in parallel
      const [addresses, alias] = await Promise.all([
        this.keyringService.createHDKeyring(mnemonic, passphrase),
        Promise.resolve(this.generateAliasName(KEYRING_CLASS.MNEMONIC, 0, 0)),
      ]);

      // Store contact with alias
      try {
        this.contactBookService.addContact({
          address: addresses[0],
          name: alias,
          isAlias: true,
          brandName: KEYRING_CLASS.MNEMONIC,
        });
      } catch (error) {
        // Handle error silently
      }

      return addresses;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Import wallet with private key
   */
  async importWalletWithPrivateKey(privateKey: string): Promise<string[]> {
    try {
      console.log('🔑 WalletService.importWalletWithPrivateKey - Starting private key import...');
      console.log('🔑 Private key provided:', !!privateKey, 'length:', privateKey.length);

      // Create simple keyring with private key
      console.log('🔑 Creating simple keyring with private key...');
      const addresses = await this.keyringService.createSimpleKeyring(privateKey);
      console.log('🔑 Created simple keyring with addresses:', addresses.length);

      // Generate alias for first account
      const alias = this.generateAliasName(KEYRING_CLASS.PRIVATE_KEY, 0, 0);

      // Store contact with alias
      await this.contactBookService.addContact({
        address: addresses[0],
        name: alias,
        isAlias: true,
        brandName: KEYRING_CLASS.PRIVATE_KEY,
      });

      return addresses;
    } catch (error) {
      console.error('Failed to import wallet with private key:', error);
      throw error;
    }
  }

  /**
   * Import wallet with mnemonic (for new wallet creation - no vault verification)
   */
  async importWalletWithMnemonicNew(
    mnemonic: string,
    password: string,
    passphrase?: string,
  ): Promise<string[]> {
    try {
      console.log('📥 WalletService.importWalletWithMnemonicNew - Starting mnemonic import...');
      console.log('📥 Mnemonic provided:', !!mnemonic, 'length:', mnemonic.length);
      console.log('📥 Password provided:', !!password);

      // Create HD keyring with mnemonic
      console.log('📥 Creating HD keyring with imported mnemonic...');
      const addresses = await this.keyringService.createHDKeyring(mnemonic, passphrase);
      console.log('📥 Created HD keyring with addresses:', addresses.length);

      // Generate alias for first account
      const alias = this.generateAliasName(KEYRING_CLASS.MNEMONIC, 0, 0);

      // Store contact with alias
      await this.contactBookService.addContact({
        address: addresses[0],
        name: alias,
        isAlias: true,
        brandName: KEYRING_CLASS.MNEMONIC,
      });

      return addresses;
    } catch (error) {
      console.error('Failed to import wallet with mnemonic:', error);
      throw error;
    }
  }

  /**
   * Unlock wallet with password - Rabby-style
   */
  async unlockWallet(password: string): Promise<boolean> {
    try {
      await this.keyringService.boot(password);
      await this.keyringService.submitPassword(password);
      this.lockService.markAsUnlocked();

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Lock wallet
   */
  async lockWallet(): Promise<void> {
    await this.keyringService.lock();
    this.lockService.lockWallet();
  }

  /**
   * Boot keyring for new wallet creation (no vault verification)
   */
  async bootForNewWallet(password: string): Promise<void> {
    return this.keyringService.bootForNewWallet(password);
  }

  /**
   * Check if wallet is locked
   */
  isLocked(): boolean {
    return this.lockService.isLocked();
  }

  /**
   * Get all accounts
   */
  async getAllAccounts(): Promise<any[]> {
    try {
      const keyringAccounts = await this.keyringService.getAllAccounts();

      const accounts = [];

      for (const account of keyringAccounts) {
        const contact = this.contactBookService.getContactByAddress(account.address);
        accounts.push({
          address: account.address,
          type: account.type,
          brandName: account.brandName,
          alianName: contact?.name || account.alianName, // Use stored alias first
        });
      }

      return accounts;
    } catch (error) {
      console.error('Failed to get accounts:', error);
      return [];
    }
  }

  /**
   * Get current account
   */
  async getCurrentAccount(): Promise<any | null> {
    try {
      const currentAddress = this.lockService.getCurrentAddress();
      if (!currentAddress) {
        const allAccounts = await this.getAllAccounts();
        if (allAccounts.length > 0) {
          this.lockService.setCurrentAddress(allAccounts[0].address);
          return allAccounts[0];
        }
        return null;
      }

      const contact = this.contactBookService.getContactByAddress(currentAddress);
      return {
        address: currentAddress,
        alianName: contact?.name,
        brandName: contact?.brandName,
      };
    } catch (error) {
      console.error('Failed to get current account:', error);
      return null;
    }
  }

  /**
   * Set current account
   */
  setCurrentAccount(address: string): void {
    this.lockService.setCurrentAddress(address);
  }

  /**
   * Add new account
   */
  async addNewAccount(): Promise<string> {
    try {
      // Add account to HD keyring
      const addresses = await this.keyringService.addAccounts(1);

      // Generate alias for new account
      const allAccounts = await this.getAllAccounts();
      const alias = this.generateAliasName(KEYRING_CLASS.MNEMONIC, 0, allAccounts.length - 1);

      // Store contact with alias
      await this.contactBookService.addContact({
        address: addresses[0],
        name: alias,
        isAlias: true,
        brandName: KEYRING_CLASS.MNEMONIC,
      });

      return addresses[0];
    } catch (error) {
      console.error('Failed to add new account:', error);
      throw error;
    }
  }

  /**
   * Remove account
   */
  async removeAccount(address: string): Promise<void> {
    try {
      await this.keyringService.removeAccount(address);
      this.contactBookService.removeContactByAddress(address);
    } catch (error) {
      console.error('Failed to remove account:', error);
      throw error;
    }
  }

  /**
   * Sign transaction
   */
  async signTransaction(address: string, transaction: any): Promise<any> {
    try {
      return await this.keyringService.signTransaction(address, transaction);
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }

  /**
   * Sign message
   */
  async signMessage(address: string, message: any): Promise<string> {
    try {
      return await this.keyringService.signMessage(address, message);
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  /**
   * Sign typed data
   */
  async signTypedData(address: string, typedData: any): Promise<string> {
    try {
      return await this.keyringService.signTypedData(address, typedData);
    } catch (error) {
      console.error('Failed to sign typed data:', error);
      throw error;
    }
  }

  /**
   * Export account
   */
  async exportAccount(address: string): Promise<string> {
    try {
      return await this.keyringService.exportAccount(address);
    } catch (error) {
      console.error('Failed to export account:', error);
      throw error;
    }
  }

  /**
   * Export mnemonic
   */
  async exportMnemonic(): Promise<string> {
    try {
      return await this.keyringService.exportMnemonic();
    } catch (error) {
      console.error('Failed to export mnemonic:', error);
      throw error;
    }
  }

  // ===== SOCIAL LOGIN FUNCTIONALITY DISABLED =====
  // Social login backend methods have been commented out
  // but kept for reference if functionality needs to be restored later
  //
  // /**
  //  * Create wallet from social login - Integrates Web3Auth with existing wallet system
  //  */
  // async createSocialWallet(socialData: SocialLoginResult): Promise<{
  //   address: string;
  //   userInfo: SocialUserInfo;
  // }> {
  //   return trackOperation('wallet.createSocial', async () => {
  //     console.log('🚀 WalletService.createSocialWallet - Creating wallet from social login...');
  //
  //     try {
  //       let address: string;
  //
  //       // Check if we have a managed key scenario (Web3Auth security feature)
  //       if (socialData.privateKey === "WEB3AUTH_MANAGED") {
  //         console.log('🔐 Using Web3Auth provider-managed keys (secure approach)');
  //
  //         // Use the address from the social login result directly
  //         address = socialData.address;
  //
  //         if (!address) {
  //           throw new Error('No address available from Web3Auth provider');
  //         }
  //
  //         // Store Web3Auth provider reference for signing operations
  //         // The private key remains managed by Web3Auth for security
  //         await this.keyringService.storeWeb3AuthProvider(socialData.provider);
  //
  //       } else {
  //         // Traditional private key import
  //         console.log('🔐 Importing private key into keyring system');
  //         const addresses = await this.keyringService.createSimpleKeyring(socialData.privateKey);
  //
  //         if (!addresses || addresses.length === 0) {
  //           throw new Error('Failed to create wallet from social login');
  //         }
  //
  //         address = addresses[0];
  //       }
  //
  //       // Generate alias for social account
  //       const alias = this.generateSocialAliasName(socialData.userInfo);
  //
  //       // Store contact with social user info
  //       await this.contactBookService.addContact({
  //         address: address,
  //         name: alias,
  //         isAlias: true,
  //         brandName: `Social (${socialData.userInfo.typeOfLogin})`,
  //         socialUserInfo: socialData.userInfo, // Store social user info for future reference
  //       });
  //
  //       // Mark wallet as unlocked
  //       this.lockService.markAsUnlocked();
  //       this.lockService.setCurrentAddress(address);
  //
  //       console.log('✅ Social wallet created successfully');
  //
  //       return {
  //         address: address,
  //         userInfo: socialData.userInfo,
  //       };
  //     } catch (error) {
  //       console.error('❌ Failed to create social wallet:', error);
  //       throw error;
  //     }
  //   });
  // }

  // /**
  //  * Get all social accounts
  //  */
  // async getSocialAccounts(): Promise<any[]> {
  //   try {
  //     const allAccounts = await this.getAllAccounts();
  //     return allAccounts.filter(account =>
  //       account.brandName && account.brandName.includes('Social')
  //     );
  //   } catch (error) {
  //     console.error('Failed to get social accounts:', error);
  //     return [];
  //   }
  // }
  //
  // /**
  //  * Check if social account exists
  //  */
  // async hasSocialAccount(verifierId: string): Promise<boolean> {
  //   try {
  //     const socialAccounts = await this.getSocialAccounts();
  //     return socialAccounts.some(account =>
  //       account.socialUserInfo?.verifierId === verifierId
  //     );
  //   } catch (error) {
  //     console.error('Failed to check social account existence:', error);
  //     return false;
  //   }
  // }
  //
  // /**
  //  * Get social account by verifier ID
  //  */
  // async getSocialAccount(verifierId: string): Promise<any | null> {
  //   try {
  //     const socialAccounts = await this.getSocialAccounts();
  //     return socialAccounts.find(account =>
  //       account.socialUserInfo?.verifierId === verifierId
  //     ) || null;
  //   } catch (error) {
  //     console.error('Failed to get social account:', error);
  //     return null;
  //   }
  // }
  //
  // /**
  //  * Generate alias name for social accounts
  //  */
  // private generateSocialAliasName(userInfo: SocialUserInfo): string {
  //   const providerName = userInfo.typeOfLogin.charAt(0).toUpperCase() + userInfo.typeOfLogin.slice(1);
  //
  //   if (userInfo.name) {
  //     return `${userInfo.name} (${providerName})`;
  //   } else if (userInfo.email) {
  //     const emailParts = userInfo.email.split('@');
  //     return `${emailParts[0]} (${providerName})`;
  //   } else {
  //     return `${providerName} Account`;
  //   }
  // }
  // ===== END SOCIAL LOGIN FUNCTIONALITY =====

  /**
   * Reset wallet
   */
  resetWallet(): void {
    this.keyringService.clearAll();
    this.lockService.lockWallet();
    this.contactBookService.clearAll();
  }

  /**
   * Generate alias name
   */
  generateAliasName(brandName: string, keyringCount: number, addressCount: number): string {
    if (brandName === KEYRING_CLASS.MNEMONIC) {
      return `Account ${addressCount + 1}`;
    } else if (brandName === KEYRING_CLASS.PRIVATE_KEY) {
      return `Private Key ${keyringCount + 1}`;
    } else {
      return `${brandName} ${addressCount + 1}`;
    }
  }
}

// Create and export instance
export const walletService = new WalletService();
