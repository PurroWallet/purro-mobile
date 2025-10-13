/**
 * Encryptor service for encrypting/decrypting sensitive data
 * Following Rabby's exact implementation using react-native-aes-crypto
 */

import Aes from 'react-native-aes-crypto';

export interface EncryptorAdapter {
  encrypt(password: string, data: any): Promise<string>;
  decrypt(password: string, encryptedData: string): Promise<any>;
}

const algorithms = 'aes-256-cbc';
const algorithms_pbkdf2 = 'sha256';

/**
 * Generate random salt using native crypto
 * @param byteCount - Number of bytes for salt (default 32)
 * @returns Base64 encoded salt string
 */
async function _generateSalt(byteCount = 32) {
  const saltStr = await Aes.randomKey(byteCount);
  return btoa(saltStr);
}

/**
 * Generate encryption key from password using PBKDF2
 * @param password - User password
 * @param salt - Salt for key derivation
 * @returns Derived key (base64)
 */
async function _generateKey(password: string, salt: string) {
  return Aes.pbkdf2(password, salt, 5000, 256, algorithms_pbkdf2);
}

/**
 * Derive key from password with salt
 * @param password - User password
 * @param salt - Salt string
 * @returns Encryption key
 */
async function _keyFromPassword(password: string, salt: string) {
  return _generateKey(password, salt);
}

/**
 * Encrypt text with key using AES-256-CBC
 * @param text - Plain text to encrypt
 * @param keyBase64 - Base64 encoded encryption key
 * @returns Encrypted data with IV
 */
async function _encryptWithKey(text: string, keyBase64: string) {
  const iv = await Aes.randomKey(16);
  return Aes.encrypt(text, keyBase64, iv, algorithms).then((cipher: any) => ({
    cipher,
    iv,
    salt: '',
  }));
}

/**
 * Decrypt encrypted data using key
 * @param encryptedData - Encrypted data object with cipher and IV
 * @param key - Decryption key
 * @returns Decrypted plain text
 */
async function _decryptWithKey(encryptedData: any, key: string) {
  return Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, algorithms);
}

/**
 * Encryptor class implementing EncryptorAdapter
 * Uses AES-256-CBC with PBKDF2 key derivation
 */
export class Encryptor implements EncryptorAdapter {
  key = null;

  /**
   * Encrypts a JS object using a password (and AES encryption with native libraries)
   * @param password - User password
   * @param object - Object to encrypt
   * @returns Promise resolving to stringified encrypted data
   */
  async encrypt(password: string, object: any): Promise<string> {
    try {
      const salt = await _generateSalt(16);
      const key = await _keyFromPassword(password, salt);
      const result = await _encryptWithKey(JSON.stringify(object), key);
      result.salt = salt;

      return JSON.stringify(result);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts an encrypted JS object (encryptedString)
   * using a password (and AES decryption with native libraries)
   * @param password - Password used for decryption
   * @param encryptedString - String to decrypt
   * @returns Promise resolving to decrypted data object
   */
  async decrypt(password: string, encryptedString: string): Promise<any> {
    try {
      const encryptedData = JSON.parse(encryptedString);
      const key = await _keyFromPassword(password, encryptedData.salt);
      const data = await _decryptWithKey(encryptedData, key);
      const result = JSON.parse(data);
      return result;
    } catch (error) {
      throw new Error(
        'Failed to decrypt data - invalid password or corrupted data',
      );
    }
  }

  /**
   * Decrypt with detailed logging (for debugging)
   */
  async decryptWithLogging(
    password: string,
    encryptedString: string,
  ): Promise<any> {
    try {
      console.time('🔐 Total Decrypt');
      console.log(
        '🔍 Encrypted vault size:',
        encryptedString.length,
        'characters',
      );

      const encryptedData = JSON.parse(encryptedString);
      console.log(
        '🔍 Encrypted data size:',
        JSON.stringify(encryptedData).length,
        'characters',
      );
      console.log('🔍 Encrypted data keys:', Object.keys(encryptedData));

      console.time('🔑 PBKDF2 Key Derivation');
      const key = await _keyFromPassword(password, encryptedData.salt);
      console.timeEnd('🔑 PBKDF2 Key Derivation');

      console.time('🔓 AES Decrypt');
      const data = await _decryptWithKey(encryptedData, key);
      console.timeEnd('🔓 AES Decrypt');

      console.log('🔍 Decrypted data size:', data.length, 'characters');

      console.time('📄 JSON Parse');
      const result = JSON.parse(data);
      console.timeEnd('📄 JSON Parse');

      console.log('🔍 Decrypted vault keys:', Object.keys(result));
      if (result.hdKeyrings) {
        console.log('🔍 HD Keyrings count:', result.hdKeyrings.length);
        console.log(
          '🔍 First keyring size:',
          JSON.stringify(result.hdKeyrings[0] || {}).length,
          'characters',
        );
      }

      console.timeEnd('🔐 Total Decrypt');
      return result;
    } catch (error) {
      throw new Error(
        'Failed to decrypt data - invalid password or corrupted data',
      );
    }
  }
}

// Export singleton instance
export const appEncryptor = new Encryptor();
