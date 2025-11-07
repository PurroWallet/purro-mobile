import { Buffer } from 'buffer';
import Aes from 'react-native-aes-crypto';
import {
  ALGORITHM,
  IV_LENGTH,
  PBKDF2_ALGORITHM,
  PBKDF2_ITERATIONS,
  SALT_LENGTH,
} from '../constants/encryption';

export class EncryptionService {
  async encrypt(password: string, data: any): Promise<string> {
    try {
      console.log('🔐 EncryptionService: Starting encryption...');
      console.time('🔍 Encryption total time');
      console.log('🔍 Aes object:', Aes);
      console.log('🔍 Available methods:', Object.getOwnPropertyNames(Aes));
      console.log('🔍 Aes.randomKey:', Aes.randomKey);
      console.time('🔑 Salt generation');
      const salt = await Aes.randomKey(SALT_LENGTH);
      console.timeEnd('🔑 Salt generation');
      console.log('🔑 Salt generated');

      console.time('🔐 PBKDF2 key derivation');
      const key = await Aes.pbkdf2(password, salt, PBKDF2_ITERATIONS, 256, PBKDF2_ALGORITHM);
      console.timeEnd('🔐 PBKDF2 key derivation');
      console.log('🔐 Key derived successfully');

      console.time('🔢 IV generation');
      const iv = await Aes.randomKey(IV_LENGTH);
      console.timeEnd('🔢 IV generation');
      console.log('🔢 IV generated');

      console.time('🔒 AES encryption');
      const cipher = await Aes.encrypt(JSON.stringify(data), key, iv, ALGORITHM);
      console.timeEnd('🔒 AES encryption');
      console.log('🔒 Data encrypted successfully');

      console.timeEnd('🔍 Encryption total time');
      return JSON.stringify({ cipher, iv, salt });
    } catch (error) {
      console.error('❌ EncryptionService encrypt error:', error);
      throw new Error(
        `Failed to encrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async decrypt(password: string, encryptedData: string): Promise<any> {
    try {
      const encrypted = JSON.parse(encryptedData);
      const key = await Aes.pbkdf2(
        password,
        encrypted.salt,
        PBKDF2_ITERATIONS,
        256,
        PBKDF2_ALGORITHM,
      );
      const data = await Aes.decrypt(encrypted.cipher, key, encrypted.iv, ALGORITHM);

      return JSON.parse(data);
    } catch (error) {
      throw new Error('Failed to decrypt data - invalid password');
    }
  }

  async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    const saltBase64 = salt.toString('base64');
    const keyBase64 = await Aes.pbkdf2(
      password,
      saltBase64,
      PBKDF2_ITERATIONS,
      256,
      PBKDF2_ALGORITHM,
    );
    return Buffer.from(keyBase64, 'base64');
  }

  async generateRandomBytes(byteCount: number): Promise<Buffer> {
    const randomString = await Aes.randomKey(byteCount);
    return Buffer.from(randomString, 'base64');
  }
}

export const encryptionService = new EncryptionService();
