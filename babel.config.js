module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['@react-native/babel-preset', 'nativewind/babel'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@/theme': './src/theme',
            '@/hooks': './src/core/hooks',
            '@/utils': './src/utils',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
