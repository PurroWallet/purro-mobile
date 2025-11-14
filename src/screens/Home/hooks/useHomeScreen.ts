import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { AccountBottomSheetRef } from '@/components/AccountBottomSheet';
import { apisKeychain, apisLock, apisWallet } from '@/core/apis';
import type { ChainTokenData, TokenWithMetadata } from '@/core/apis/alchemy/types';
import { useCurrentAccount } from '@/core/hooks/wallet/useCurrentAccount';
import { useTokens } from '@/core/hooks/wallet/useTokens';
import { tokenService } from '@/core/services';
import type { TokenInfo } from '@/core/services/TokenService';
import { useAppStore } from '@/stores/appStore';
import type { NavigationProp, RootStackParamList } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';
import type { ReceiveTokenSheetRef } from '../components/ReceiveTokenSheet';
import type { SentTokenSheetRef } from '../components/SendTokenSheet';

export interface Account {
  address: string;
  type?: string;
  brandName?: string;
  alianName?: string;
}

export interface PerpPosition {
  id: string;
  name: string;
  multiplier: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
}

export interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  value: string;
}

export interface UseHomeScreenResult {
  accountBottomSheetRef: RefObject<AccountBottomSheetRef | null>;
  sentTokenSheetRef: RefObject<SentTokenSheetRef | null>;
  receiveTokenSheetRef: RefObject<ReceiveTokenSheetRef | null>;
  selectedTab: 'EVM' | 'Spot' | 'Perpetuals';
  onSelectTab: (tab: 'EVM' | 'Spot' | 'Perpetuals') => void;
  currentAccount: Account | null;
  perpPositions: PerpPosition[];
  tokens: Token[];
  totalBalance: string;
  totalTokensCount: number;
  isLoadingTokens: boolean;
  handleAccountSelect: (account: Account) => void;
  handleResetWallet: () => Promise<void>;
  openAccountSheet: () => void;
  openSendSheet: () => void;
  openReceiveSheet: () => void;
  refreshTokens: () => Promise<void>;
  navigateSearch: () => void;
  // New EVM token list properties
  evmTokens: ChainTokenData[];
  isLoadingEvmTokens: boolean;
  evmTokensError: Error | null;
  refreshEvmTokens: () => Promise<void>;
  handleTokenPress: (token: TokenWithMetadata, chain: ChainTokenData['chain']) => void;
  handleSendToken: (token: TokenWithMetadata, chain: ChainTokenData['chain']) => void;
  handleSwapToken: (token: TokenWithMetadata, chain: ChainTokenData['chain']) => void;
}

export const useHomeScreen = (): UseHomeScreenResult => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<keyof RootStackParamList>>();
  const accountBottomSheetRef = useRef<AccountBottomSheetRef | null>(null);
  const sentTokenSheetRef = useRef<SentTokenSheetRef | null>(null);
  const receiveTokenSheetRef = useRef<ReceiveTokenSheetRef | null>(null);
  const setWalletExists = useAppStore((state) => state.setWalletExists);
  const [selectedTab, setSelectedTab] = useState<'EVM' | 'Spot' | 'Perpetuals'>('EVM');
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenInfo[]>([]);
  const {
    currentAccount: currentAccountQuery,
    refetchCurrentAccount,
    setCurrentAccount: setCurrentAccountQuery,
  } = useCurrentAccount();
  const currentAccount = (currentAccountQuery as Account | null) ?? null;

  // Use the new useTokens hook for EVM tokens
  const {
    tokens: evmTokens,
    isLoading: isLoadingEvmTokens,
    error: evmTokensError,
    refetch: refetchEvmTokens,
  } = useTokens(currentAccount?.address || '', false);

  const perpPositions = useMemo<PerpPosition[]>(
    () => [
      {
        id: '1',
        name: 'Lilly',
        multiplier: '20x',
        value: '$111,638',
        change: '-20%',
        changeType: 'negative',
      },
      {
        id: '2',
        name: 'LIQD',
        multiplier: '20x',
        value: '$111,638',
        change: '-20%',
        changeType: 'negative',
      },
      {
        id: '3',
        name: 'LIQD',
        multiplier: '20x',
        value: '$111,638',
        change: '-20%',
        changeType: 'negative',
      },
    ],
    [],
  );

  const tokens = useMemo<Token[]>(
    () =>
      tokenBalances.map((token) => ({
        id: token.address,
        name: token.name,
        symbol: token.symbol,
        balance: parseFloat(token.balance).toFixed(4),
        value: `$${token.usdValue.toFixed(2)}`,
      })),
    [tokenBalances],
  );

  // Calculate total balance
  const totalBalance = useMemo(() => {
    const total = tokenBalances.reduce((sum, token) => sum + token.usdValue, 0);
    return `$${total.toFixed(2)}`;
  }, [tokenBalances]);

  const totalTokensCount = tokens.length;

  // Fetch token balances
  const fetchTokenBalances = useCallback(async () => {
    if (!currentAccount?.address) return;

    setIsLoadingTokens(true);
    try {
      const balances = await tokenService.getAllTokenBalances(currentAccount.address);
      setTokenBalances(balances);
    } catch (error) {
      console.error('Failed to fetch token balances:', error);
      // Fallback to showing native token with 0 balance
      setTokenBalances([
        {
          address: 'native',
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
          balance: '0',
          balanceRaw: '0',
          usdPrice: 0,
          usdValue: 0,
        },
      ]);
    } finally {
      setIsLoadingTokens(false);
    }
  }, [currentAccount?.address]);

  // Fetch balances when account changes
  useEffect(() => {
    fetchTokenBalances();
  }, [fetchTokenBalances]);

  useFocusEffect(
    useCallback(() => {
      refetchCurrentAccount();
    }, [refetchCurrentAccount]),
  );

  const handleAccountSelect = useCallback(
    (account: Account) => {
      setCurrentAccountQuery(account);
    },
    [setCurrentAccountQuery],
  );

  const handleResetWallet = useCallback(async () => {
    try {
      apisWallet.resetWallet();
      await apisLock.lockWallet();

      try {
        await apisKeychain.resetGenericPassword();
      } catch (error) {
        console.log('No keychain data to clear:', error);
      }

      setWalletExists(false);
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('Error resetting wallet:', error);
      Alert.alert(t('errors.generic.title'), t('errors.wallet.resetFailed'));
    }
  }, [navigation, setWalletExists, t]);

  const openAccountSheet = useCallback(() => {
    accountBottomSheetRef.current?.present();
  }, []);

  const openSendSheet = useCallback(() => {
    sentTokenSheetRef.current?.present();
  }, []);

  const openReceiveSheet = useCallback(() => {
    receiveTokenSheetRef.current?.present();
  }, []);

  function navigateSearch() {
    navigation.navigate('SearchScreen');
  }

  const onSelectTab = useCallback((tab: 'EVM' | 'Spot' | 'Perpetuals') => {
    setSelectedTab(tab);
  }, []);

  // Handle EVM token press
  const handleTokenPress = useCallback(
    (token: TokenWithMetadata, chain: ChainTokenData['chain']) => {
      console.log('Token pressed:', token.metadata.symbol, 'on', chain);
      // TODO: Navigate to token details screen
    },
    [],
  );

  // Handle send token
  const handleSendToken = useCallback(
    (token: TokenWithMetadata, chain: ChainTokenData['chain']) => {
      console.log('Send token:', token.metadata.symbol, 'on', chain);
      // TODO: Open send sheet with pre-selected token
      openSendSheet();
    },
    [openSendSheet],
  );

  // Handle swap token
  const handleSwapToken = useCallback(
    (token: TokenWithMetadata, chain: ChainTokenData['chain']) => {
      console.log('Swap token:', token.metadata.symbol, 'on', chain);
      // TODO: Navigate to swap screen with pre-selected token
      navigation.navigate('Swap');
    },
    [navigation],
  );

  // Refresh EVM tokens
  const refreshEvmTokens = useCallback(async () => {
    await refetchEvmTokens();
  }, [refetchEvmTokens]);

  return {
    accountBottomSheetRef,
    sentTokenSheetRef,
    receiveTokenSheetRef,
    selectedTab,
    onSelectTab,
    currentAccount,
    perpPositions,
    tokens,
    totalBalance,
    totalTokensCount,
    isLoadingTokens,
    handleAccountSelect,
    handleResetWallet,
    openAccountSheet,
    openSendSheet,
    openReceiveSheet,
    refreshTokens: fetchTokenBalances,
    navigateSearch,
    // New EVM token list properties
    evmTokens,
    isLoadingEvmTokens,
    evmTokensError,
    refreshEvmTokens,
    handleTokenPress,
    handleSendToken,
    handleSwapToken,
  };
};
