/**
 * i18n utility for internationalization
 */

import i18n from 'i18next';
import { initReactI18next, useTranslation as useI18nTranslation } from 'react-i18next';
import enMessages from '@/locales/en/messages.json';
import viMessages from '@/locales/vi/messages.json';

// English translations
const en = {
  translation: enMessages as Record<string, any>,
  fallback: {
    common: {
      continue: 'Continue',
      cancel: 'Cancel',
      confirm: 'Confirm',
      ok: 'OK',
      error: 'Error',
      success: 'Success',
    },
    welcome: {
      title: 'Welcome to Purro',
      subtitle: 'Your Gateway to Hyperliquid',
      createWallet: 'Create wallet',
      importWallet: 'Import existing wallet',
      termsRequired: 'Terms Required',
      acceptTerms: 'Please accept the Terms of Service and Privacy Policy to continue.',
    },
    seedPhrase: {
      title: 'Your Seed Phrase',
      verifyTitle: 'Verify seed phrase',
      saved: "I've saved my seed phrase",
      warning:
        'Store your seed phrase in a safe & offline place, never share it with anyone. This is the only way to recover your wallet.',
      securityNotice: 'Security Notice',
      screenshotDisabled:
        'Screenshots are disabled for your security. Please write down your seed phrase on paper and store it safely.',
    },
    password: {
      createTitle: 'Create password',
      enterPassword: 'Enter password',
      confirmPassword: 'Confirm password',
      requirement: 'Password must be at least 8 characters',
      mismatch: 'Passwords do not match',
    },
    unlock: {
      title: 'Unlock Purro Wallet',
      enterPassword: 'Enter your password',
      invalidPassword: 'Invalid password',
      tooManyAttempts: 'Too many failed attempts',
    },
    biometrics: {
      enable: 'Enable Biometric Authentication?',
      enableMessage: 'Would you like to use Face ID / Touch ID to unlock your wallet?',
      faceId: 'Face ID',
      touchId: 'Touch ID',
      fingerprint: 'Fingerprint',
    },
    native: {
      authentication: {
        auth_prompt_title: 'Authenticate',
        auth_prompt_desc: 'Please authenticate to continue',
        auth_prompt_cancel: 'Cancel',
      },
    },
  },
};

// Vietnamese translations
const vi = {
  translation: viMessages as Record<string, any>,
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: { en, vi },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })
  .catch((error: unknown) => {
    console.error('i18n initialization error:', error);
  });

export default i18n;

export const useTranslation = () => {
  return useI18nTranslation();
};
