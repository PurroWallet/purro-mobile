import * as WebBrowser from '@toruslabs/react-native-web-browser';
import { CHAIN_NAMESPACES } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import Web3Auth, { LOGIN_PROVIDER, WEB3AUTH_NETWORK } from '@web3auth/react-native-sdk';
import EncryptedStorage from 'react-native-encrypted-storage';

const clientId =
  'BLEqpuoGbrZ9E96qYet28x6_BAniXmhqhpQdt_BKKY04X3aLUgFw8_FH-_SmZfpd7oGV-6cwynQu5w34bPsvl94';

const scheme = 'purrowallet';
// CRITICAL: Use /auth suffix for Web3Auth v8.1.0 (not /oauth)
const resolvedRedirectUrl = `${scheme}://auth`;

// Chain config for Ethereum - Use reliable RPC for production
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x1',
  rpcTarget: 'https://ethereum.publicnode.com',
  displayName: 'Ethereum Mainnet',
  blockExplorerUrl: 'https://etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
  decimals: 18,
};

export interface SocialLoginResult {
  address?: string;
  privateKey?: string;
  userInfo: {
    email?: string;
    name?: string;
    profileImage?: string;
    typeOfLogin?: string;
    verifier?: string;
    verifierId?: string;
  };
  provider?: any;
}

export class Web3AuthService {
  private web3auth: Web3Auth | null = null;
  private ethereumProvider: EthereumPrivateKeyProvider | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.ethereumProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig },
      });

      this.web3auth = new Web3Auth(WebBrowser, EncryptedStorage, {
        clientId,
        network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        redirectUrl: resolvedRedirectUrl,
        privateKeyProvider: this.ethereumProvider,
      });

      await this.web3auth.init();
      this.initialized = true;
    } catch (error) {
      throw error;
    }
  }

  async loginWithGoogle(): Promise<SocialLoginResult> {
    if (!this.initialized || !this.web3auth) {
      await this.initialize();
    }

    try {
      // Login with Google using v8.1.0 pattern
      const info = await this.web3auth!.login({
        loginProvider: LOGIN_PROVIDER.GOOGLE,
        redirectUrl: resolvedRedirectUrl,
      });

      // Get user info
      const userInfo = this.web3auth!.userInfo();

      return {
        userInfo: {
          email: userInfo?.email || '',
          name: userInfo?.name || '',
          profileImage: userInfo?.profileImage || '',
          typeOfLogin: userInfo?.typeOfLogin || 'google',
          verifier: userInfo?.verifier || '',
          verifierId: userInfo?.verifierId || userInfo?.email || '',
        },
        provider: this.web3auth!.provider, // Available directly in v8.1.0
      };
    } catch (error) {
      console.error('❌ Failed to login with Google:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (this.web3auth) {
      await this.web3auth.logout();
    }
  }

  async isConnected(): Promise<boolean> {
    if (!this.web3auth) {
      return false;
    }
    return this.web3auth.connected;
  }

  async getCurrentUser(): Promise<SocialLoginResult | null> {
    // CRITICAL: Use 'connected' instead of 'privKey' in v8.1.0
    if (!this.initialized || !this.web3auth || !this.web3auth.connected) {
      return null;
    }

    try {
      const userInfo = this.web3auth.userInfo();

      return {
        userInfo: {
          email: userInfo?.email || '',
          name: userInfo?.name || '',
          profileImage: userInfo?.profileImage || '',
          typeOfLogin: userInfo?.typeOfLogin || 'unknown',
          verifier: userInfo?.verifier || '',
          verifierId: userInfo?.verifierId || userInfo?.email || '',
        },
        provider: this.web3auth.provider, // Available directly in v8.1.0
      };
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      return null;
    }
  }
}

export const web3AuthService = new Web3AuthService();
