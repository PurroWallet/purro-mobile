const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const defaultConfig = getDefaultConfig(__dirname);

const config = mergeConfig(defaultConfig, {
  resolver: {
    extraNodeModules: {
      // Map Node.js modules to React Native compatible versions
      assert: require.resolve('empty-module'),
      http: require.resolve('empty-module'),
      https: require.resolve('empty-module'),
      os: require.resolve('empty-module'),
      url: require.resolve('empty-module'),
      zlib: require.resolve('empty-module'),
      path: require.resolve('empty-module'),
      stream: require.resolve('readable-stream'),
      buffer: require.resolve('buffer'),
      events: require.resolve('events'),
      process: require.resolve('process'),
    },
    // CRITICAL: Redirect crypto imports to react-native-quick-crypto for Web3Auth v8.1.0
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'crypto') {
        return context.resolveRequest(context, 'react-native-quick-crypto', platform);
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
});

module.exports = withNativeWind(config, { input: './global.css' });
