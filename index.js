/**
 * @format
 */

// Polyfill for crypto.getRandomValues (MUST be first)
import 'react-native-get-random-values';

// Polyfill for Buffer (required by ethers.js and crypto libraries)
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
