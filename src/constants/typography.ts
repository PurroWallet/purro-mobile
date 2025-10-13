/**
 * Typography constants for Purro Wallet
 * Based on Figma design using Figtree font
 */

export const Typography = {
  // Font families (Figtree from Figma, fallback to system)
  fontFamily: {
    regular: 'Figtree-Regular',
    medium: 'Figtree-Medium',
    semiBold: 'Figtree-SemiBold',
    bold: 'Figtree-Bold',
  },

  // Font sizes (from Figma)
  fontSize: {
    h4: 32, // h4-semi-32 from Figma
    button: 18, // button/global-18pt
    label: 14, // label/Regu-14pt
    body: 18, // Default body text
    caption: 12,
    system: 11,
  },

  // Line heights (from Figma - multiplier format)
  lineHeight: {
    h4: 35.2, // 32 * 1.1 (1.100000023841858em from Figma)
    button: 25.2, // 18 * 1.4 (1.3999999364217122em)
    label: 19.6, // 14 * 1.4 (1.4000000272478377em)
    body: 25.2, // 18 * 1.4
    tight: 1.1,
    normal: 1.4,
  },

  // Pre-defined text styles (matching Figma)
  styles: {
    // Heading 4 - Semi Bold 32pt (Your Seed Phrase, Welcome to Purro)
    h4: {
      fontSize: 32,
      lineHeight: 38, // Increased from 35.2 to prevent clipping
      fontWeight: '600' as const,
      textAlign: 'center' as const,
    },

    // Heading 3 - Semi Bold 24pt
    h3: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600' as const,
    },

    // Heading 5 - Semi Bold 18pt
    h5: {
      fontSize: 18,
      lineHeight: 26, // Increased from 24 to prevent clipping
      fontWeight: '600' as const,
    },

    // Button text - Medium 18pt (from Figma)
    button: {
      fontSize: 18,
      lineHeight: 26, // Increased from 25.2 to prevent clipping
      fontWeight: '500' as const,
    },

    // Body text - Regular 16pt
    body: {
      fontSize: 16,
      lineHeight: 24, // Increased from 22 to prevent clipping
      fontWeight: '400' as const,
    },

    // Label - Regular 14pt (from Figma)
    label: {
      fontSize: 14,
      lineHeight: 20, // Increased from 19.6 to prevent clipping
      fontWeight: '400' as const,
    },

    // Caption - Regular 12pt
    caption: {
      fontSize: 12,
      lineHeight: 18, // Increased from 16 to prevent clipping
      fontWeight: '400' as const,
    },

    // Seed phrase word - Regular 18pt
    word: {
      fontSize: 18,
      lineHeight: 26, // Increased from 25.2 to prevent clipping
      fontWeight: '400' as const,
    },

    // System text - Regular 11pt (for status bar time)
    system: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '400' as const,
    },
  },
} as const;

export type TypographyScheme = typeof Typography;
