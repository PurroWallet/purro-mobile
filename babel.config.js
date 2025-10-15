module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '@/atoms': './src/atoms',
          '@/components': './src/components',
          '@/core': './src/core',
          '@/hooks': './src/hooks',
          '@/navigation': './src/navigation',
          '@/providers': './src/providers',
          '@/screens': './src/screens',
          '@/types': './src/types',
          '@/utils': './src/utils',
        },
      },
    ],
  ],
};
