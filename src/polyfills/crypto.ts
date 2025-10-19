/**
 * Crypto polyfills for React Native
 * Fixes crypto.getRandomValues and other Web Crypto API issues
 */

// @ts-ignore - No types available for this module
import { getRandomValues } from 'react-native-get-random-values';

// Polyfill crypto.getRandomValues with proper types
declare global {
  namespace NodeJS {
    interface Global {
      crypto?: {
        getRandomValues?: (array: Uint8Array) => Uint8Array;
      };
    }
  }
}

// Initialize crypto polyfill
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = {};
}

if (typeof global.crypto.getRandomValues === 'undefined') {
  (global as any).crypto.getRandomValues = getRandomValues;
}

console.log('✅ Crypto polyfills initialized');
