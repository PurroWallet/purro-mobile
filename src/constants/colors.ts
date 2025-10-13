/**
 * Color constants for Purro Wallet
 * Based on Figma: https://www.figma.com/design/BCzVadeqWIMNWBnCpiW1sD/Purro-Wallet-UI
 */

export const Colors = {
  // Background colors
  background: {
    primary: '#161616', // Main background
    secondary: '#25272C', // Cards, inputs
    tertiary: '#494F5B', // Progress bar background
  },

  // Text colors
  text: {
    primary: '#F9F9F9', // Main text (white)
    secondary: '#6A7282', // Secondary text (gray)
    tertiary: '#EDEEF1', // Secondary button text
    disabled: '#003333', // Disabled text
  },

  // Brand colors (Purro green)
  brand: {
    primary: '#059288', // Main brand color
    secondary: '#03726A', // Darker variant
    disabled: '#0A6561', // Disabled state
    light: '#E6F7F6',
  },

  // Button colors
  button: {
    primary: {
      background: '#059288',
      text: '#F9F9F9',
      disabled: {
        background: '#0A6561',
        text: '#003333',
      },
    },
    secondary: {
      background: '#25272C',
      text: '#EDEEF1',
    },
  },

  // System colors
  system: {
    white: '#FFFFFF',
    black: '#000000',
    success: '#34C759',
    warning: '#EBAB16', // Yellow from Figma warning icon
    error: '#FF3B30',
    info: '#5AC8FA',
  },

  // Overlay colors
  overlay: {
    dark: 'rgba(0, 0, 0, 0.5)',
    light: 'rgba(255, 255, 255, 0.1)',
    cardBackground: 'rgba(37, 39, 44, 0.6)', // Seed phrase cards
  },

  // Border colors
  border: {
    primary: '#38383A',
    secondary: '#48484A',
  },
} as const;

export type ColorScheme = typeof Colors;
