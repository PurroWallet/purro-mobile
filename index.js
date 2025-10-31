// 1. Import globals FIRST - CRITICAL for Web3Auth v8.1.0
import "./globals";

// 2. Import ethers shims after globals
import "@ethersproject/shims";

// 3. Core React Native polyfills
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

// 4. Import App and register
import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);
