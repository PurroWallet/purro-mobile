// import { useCallback, useMemo, useState } from 'react';
// import Web3Auth, {
//   LOGIN_PROVIDER,
//   type LoginParams,
//   WEB3AUTH_NETWORK,
// } from '@web3auth/react-native-sdk';
// import { CHAIN_NAMESPACES } from '@web3auth/base';
// import { CommonPrivateKeyProvider } from '@web3auth/base-provider';
// import * as WebBrowser from '@toruslabs/react-native-web-browser';
// import EncryptedStorage from 'react-native-encrypted-storage';

// type SocialProvider = typeof LOGIN_PROVIDER.GOOGLE | typeof LOGIN_PROVIDER.FACEBOOK;

// type SocialLoginResult = {
//   privateKey: string;
//   userInfo: {
//     email?: string;
//     name?: string;
//     profileImage?: string;
//     verifierId?: string;
//   };
// };

// const scheme = 'purrowallet'; // Your app redirection scheme
// const redirectUrl = `${scheme}://auth`;

// const chainConfig = {
//   chainNamespace: CHAIN_NAMESPACES.EIP155,
//   chainId: '0x1',
//   rpcTarget: 'https://rpc.ankr.com/eth',
//   displayName: 'Ethereum Mainnet',
//   blockExplorerUrl: 'https://etherscan.io',
//   ticker: 'ETH',
//   tickerName: 'Ethereum',
// };

// let web3authClient: Web3Auth | null = null;
// let initPromise: Promise<void> | null = null;

// const ensureClient = async (): Promise<Web3Auth> => {
//   if (!web3authClient) {
//     const clientId = process.env.EXPO_PUBLIC_WEB3AUTH_CLIENT_ID;

//     if (!clientId) {
//       throw new Error('Missing EXPO_PUBLIC_WEB3AUTH_CLIENT_ID');
//     }

//     const privateKeyProvider = new CommonPrivateKeyProvider({
//       config: { chainConfig },
//     });

//     web3authClient = new Web3Auth(WebBrowser, EncryptedStorage, {
//       clientId,
//       network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
//       privateKeyProvider,
//       redirectUrl,
//     });
//   }

//   if (!web3authClient.connected) {
//     if (!initPromise) {
//       initPromise = web3authClient
//         .init()
//         .finally(() => {
//           initPromise = null;
//         });
//     }

//     await initPromise;
//   }

//   return web3authClient;
// };

// const performLogin = async (provider: SocialProvider): Promise<SocialLoginResult> => {
//   const client = await ensureClient();

//   const params: LoginParams = {
//     loginProvider: provider,
//   };

//   await client.login(params);

//   const userInfo = client.userInfo();
//   const privateKey = (await client.provider?.request({ method: "private_key" })) as string;

//   if (!privateKey) {
//     throw new Error('Failed to get private key');
//   }

//   return {
//     privateKey,
//     userInfo: {
//       email: userInfo?.email,
//       name: userInfo?.name,
//       profileImage: userInfo?.profileImage,
//       verifierId: userInfo?.verifierId || userInfo?.name,
//     },
//   };
// };

// const performLogout = async () => {
//   const client = await ensureClient();

//   await client.logout();
// };

// export function useSocialLogin() {
//   const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(
//     null,
//   );

//   const login = useCallback(async (provider: SocialProvider) => {
//     setLoadingProvider(provider);

//     try {
//       return await performLogin(provider);
//     } finally {
//       setLoadingProvider(null);
//     }
//   }, []);

//   const loginWithGoogle = useCallback(
//     () => login(LOGIN_PROVIDER.GOOGLE),
//     [login],
//   );
//   const loginWithFacebook = useCallback(
//     () => login(LOGIN_PROVIDER.FACEBOOK),
//     [login],
//   );

//   const isLoading = useMemo(() => loadingProvider !== null, [loadingProvider]);

//   return {
//     loginWithGoogle,
//     loginWithFacebook,
//     logout: performLogout,
//     loadingProvider,
//     isLoading,
//   };
// }
