import * as RNKeychain from 'react-native-keychain';
import { keychainStorage } from '../storage/secureStorage';
import { encryptionService } from './EncryptionService';

export enum KEYCHAIN_AUTH_TYPES {
  APPLICATION_PASSWORD = 0,
  BIOMETRICS = 1,
  PASSCODE = 2,
  REMEMBER_ME = 3,
}

const KEYCHAIN_AUTH_TYPES_KEY = 'KEYCHAIN_AUTH_TYPES';

class SecureKeychain {
  private static instance: SecureKeychain;
  private salt = 'purro_keychain_salt_v1';
  isAuthenticating = false;

  private constructor() {}

  static getInstance(): SecureKeychain {
    if (!SecureKeychain.instance) {
      SecureKeychain.instance = new SecureKeychain();
    }
    return SecureKeychain.instance;
  }

  async encryptPassword(password: string): Promise<string> {
    return encryptionService.encrypt(this.salt, { password });
  }

  async decryptPassword(encryptedPassword: string): Promise<string> {
    const result = await encryptionService.decrypt(this.salt, encryptedPassword);
    return result.password;
  }

  async setGenericPassword(
    password: string,
    type: KEYCHAIN_AUTH_TYPES = KEYCHAIN_AUTH_TYPES.BIOMETRICS,
  ): Promise<void> {
    const authOptions: Partial<RNKeychain.Options> = {
      accessible: RNKeychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      service: 'com.purrowallet',
    };

    if (type === KEYCHAIN_AUTH_TYPES.BIOMETRICS) {
      authOptions.accessControl = RNKeychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET;
      authOptions.authenticationType = RNKeychain.AUTHENTICATION_TYPE.BIOMETRICS;
      authOptions.authenticationPrompt = {
        title: 'Enable Face ID',
        description: 'Use Face ID to unlock your wallet',
        cancel: 'Cancel',
      };
    } else if (type === KEYCHAIN_AUTH_TYPES.PASSCODE) {
      authOptions.accessControl = RNKeychain.ACCESS_CONTROL.DEVICE_PASSCODE;
    }

    const encryptedPassword = await this.encryptPassword(password);

    await RNKeychain.setGenericPassword('purro-user', encryptedPassword, authOptions);

    keychainStorage.setItem(KEYCHAIN_AUTH_TYPES_KEY, type);
  }

  async getGenericPassword(): Promise<string | null> {
    try {
      this.isAuthenticating = true;

      const credentials = await RNKeychain.getGenericPassword({
        service: 'com.purrowallet',
        authenticationPrompt: {
          title: 'Unlock Purro Wallet',
          description: 'Use biometrics to unlock',
          cancel: 'Cancel',
        },
      });

      if (!credentials) {
        return null;
      }

      const password = await this.decryptPassword(credentials.password);
      return password;
    } finally {
      this.isAuthenticating = false;
    }
  }

  async resetGenericPassword(): Promise<boolean> {
    const result = await RNKeychain.resetGenericPassword({
      service: 'com.purrowallet',
    });

    if (result) {
      keychainStorage.setItem(KEYCHAIN_AUTH_TYPES_KEY, KEYCHAIN_AUTH_TYPES.APPLICATION_PASSWORD);
    }

    return result;
  }

  async getSupportedBiometryType(): Promise<RNKeychain.BIOMETRY_TYPE | null> {
    return RNKeychain.getSupportedBiometryType();
  }

  getAuthenticationType(): KEYCHAIN_AUTH_TYPES {
    return (
      keychainStorage.getItem<number>(KEYCHAIN_AUTH_TYPES_KEY) ||
      KEYCHAIN_AUTH_TYPES.APPLICATION_PASSWORD
    );
  }

  isAuthenticatedByBiometrics(): boolean {
    return this.getAuthenticationType() === KEYCHAIN_AUTH_TYPES.BIOMETRICS;
  }

  async requestGenericPassword(): Promise<string | null> {
    return this.getGenericPassword();
  }

  async isBiometricsAvailable(): Promise<boolean> {
    const biometryType = await this.getSupportedBiometryType();
    return biometryType !== null;
  }
}

// Export instance
export const secureKeychain = SecureKeychain.getInstance();

// Export helper functions
export const isAuthenticatedByBiometrics = () => secureKeychain.isAuthenticatedByBiometrics();
