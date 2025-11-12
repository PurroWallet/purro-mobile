import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type {
  NavigationProp as BaseNavigationProp,
  CompositeNavigationProp,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  SeedPhraseDisplay: {
    mnemonic: string;
    privateKey?: string;
    isWeb3Auth?: boolean;
    isAdditionalWallet?: boolean;
    userInfo?: {
      email?: string;
      name?: string;
      profileImage?: string;
      typeOfLogin?: string;
      verifier?: string;
      verifierId?: string;
    };
  };
  SeedPhraseVerify: { mnemonic: string; isAdditionalWallet?: boolean };
  SeedPhraseBackup: undefined;
  CreatePassword: {
    mnemonic?: string;
    privateKey?: string;
    isImport?: boolean;
    isPrivateKeyImport?: boolean;
    isWeb3Auth?: boolean;
    userInfo?: {
      email?: string;
      name?: string;
      profileImage?: string;
      typeOfLogin?: string;
      verifier?: string;
      verifierId?: string;
    };
  };
  WalletSuccess: {
    addresses?: string[];
    mnemonic?: string;
    isImport?: boolean;
    isAdditionalWallet?: boolean;
    socialInfo?: {
      email?: string;
      name?: string;
      profileImage?: string;
      typeOfLogin?: string;
      verifier?: string;
      verifierId?: string;
    };
  };
  ImportWallet: undefined;
  ImportMethods: undefined;
  ImportSeedPhrase: undefined;
  ImportPrivateKey: undefined;
  Unlock: undefined;
  Home: undefined;
};

export type MainTabParamList = {
  HomeMain: undefined;
  Swap: undefined;
  Nft: undefined;
  History: undefined;
};

export type NavigationProp<T extends keyof RootStackParamList> = BaseNavigationProp<
  RootStackParamList,
  T
> & {
  navigate<K extends keyof RootStackParamList>(screen: K, params?: RootStackParamList[K]): void;
  replace<K extends keyof RootStackParamList>(screen: K, params?: RootStackParamList[K]): void;
};

// Screen route props types (no navigation prop - use useNavigation hook instead)
export type SeedPhraseDisplayScreenProps = {
  route: {
    params: RootStackParamList['SeedPhraseDisplay'];
  };
};

export type SeedPhraseVerifyScreenProps = {
  route: {
    params: RootStackParamList['SeedPhraseVerify'];
  };
};

export type CreatePasswordScreenProps = {
  route: {
    params: RootStackParamList['CreatePassword'];
  };
};

type StackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type WalletSuccessScreenProps = StackScreenProps<'WalletSuccess'>;
export type ImportWalletScreenProps = StackScreenProps<'ImportWallet'>;
export type UnlockScreenProps = StackScreenProps<'Unlock'>;

export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HomeMain'>,
  NavigationProp<'Home'>
>;
