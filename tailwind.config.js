const colorVar = variable => `rgb(var(${variable}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: {
          primary: colorVar('--color-background-primary'),
          secondary: colorVar('--color-background-secondary'),
          tertiary: colorVar('--color-background-tertiary'),
        },
        text: {
          primary: colorVar('--color-text-primary'),
          secondary: colorVar('--color-text-secondary'),
          tertiary: colorVar('--color-text-tertiary'),
          disabled: colorVar('--color-text-disabled'),
        },
        brand: {
          primary: colorVar('--color-brand-primary'),
          secondary: colorVar('--color-brand-secondary'),
          disabled: colorVar('--color-brand-disabled'),
          light: colorVar('--color-brand-light'),
        },
        button: {
          primary: colorVar('--color-button-primary'),
          'primary-text': colorVar('--color-button-primary-text'),
          'primary-disabled': colorVar('--color-button-primary-disabled'),
          'primary-disabled-text': colorVar(
            '--color-button-primary-disabled-text',
          ),
          secondary: colorVar('--color-button-secondary'),
          'secondary-text': colorVar('--color-button-secondary-text'),
        },
        overlay: {
          dark: 'rgb(var(--color-overlay-dark))',
          light: 'rgb(var(--color-overlay-light))',
          card: 'rgb(var(--color-overlay-card))',
        },
        border: {
          primary: colorVar('--color-border-primary'),
          secondary: colorVar('--color-border-secondary'),
        },
        system: {
          white: colorVar('--color-system-white'),
          black: colorVar('--color-system-black'),
          success: colorVar('--color-system-success'),
          warning: colorVar('--color-system-warning'),
          error: colorVar('--color-system-error'),
          info: colorVar('--color-system-info'),
        },
      },
      fontFamily: {
        regular: ['Figtree-Regular', 'System'],
        medium: ['Figtree-Medium', 'System'],
        semibold: ['Figtree-SemiBold', 'System'],
        bold: ['Figtree-Bold', 'System'],
      },
      fontSize: {
        h4: ['32px', { lineHeight: '38px', fontWeight: '600' }],
        h3: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        h5: ['18px', { lineHeight: '26px', fontWeight: '600' }],
        button: ['18px', { lineHeight: '26px', fontWeight: '500' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        label: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '18px', fontWeight: '400' }],
        word: ['18px', { lineHeight: '26px', fontWeight: '400' }],
        system: ['11px', { lineHeight: '16px', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};
