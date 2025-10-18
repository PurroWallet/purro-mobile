module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['@react-native/babel-preset', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
          },
        }
      ],
      'react-native-reanimated/plugin',
      'react-native-worklets/plugin',
    ],
  };
};
