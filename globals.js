// CRITICAL: Install react-native-quick-crypto for Web3Auth v8.1.0
import { install } from "react-native-quick-crypto";
install();

// Set up globals before importing Buffer to avoid circular dependencies
global.location = {
  protocol: "file:",
};

// Ensure process global exists with correct version
global.process.version = "v16.0.0";
if (!global.process.version) {
  global.process = require("process");
}

// Set browser flag for React Native environment
process.browser = true;

// Now import Buffer after crypto is set up
global.Buffer = require("buffer").Buffer;

// Add missing base64 polyfills for Web3Auth v8.1.0 using built-in browser APIs
global.base64ToArrayBuffer = (base64) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

global.base64FromArrayBuffer = (arrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer);
  let binaryString = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
};
