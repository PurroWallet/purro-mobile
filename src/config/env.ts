/**
 * Environment Configuration
 * Centralized configuration for API keys and environment variables
 *
 * TODO: Move these to actual environment variables using react-native-config or similar
 * For now, they are stored here for easy configuration
 */

export const ENV = {
  ALCHEMY_API_KEY: 'pQZCrFA4q__RcYkvhoPOHUivAjmSIgyF',
  ETHERSCAN_API_KEY: 'XE2CRX7TH65UUNW4GNSUGWRD6I4EBJUZSN',
} as const;

/**
 * Get Alchemy API key
 */
export function getAlchemyApiKey(): string {
  return ENV.ALCHEMY_API_KEY;
}

/**
 * Get Etherscan API key
 */
export function getEtherscanApiKey(): string {
  return ENV.ETHERSCAN_API_KEY;
}
