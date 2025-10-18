import type { NavigationProp as BaseNavigationProp } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  SeedPhraseDisplay: { mnemonic: string };
  SeedPhraseVerify: { mnemonic: string };
  SeedPhraseBackup: undefined;
  CreatePassword: { 
    mnemonic?: string; 
    isImport?: boolean;
    isPrivateKeyImport?: boolean;
  };
  WalletSuccess: { 
    addresses: string[]; 
    isImport?: boolean;
  };
  ImportWallet: undefined;
  ImportMethods: undefined;
  ImportSeedPhrase: undefined;
  ImportPrivateKey: undefined;
  Unlock: undefined;
  Home: undefined;
  Settings: undefined;
};

export type NavigationProp<T extends keyof RootStackParamList> = BaseNavigationProp<RootStackParamList, T> & {
  navigate<K extends keyof RootStackParamList>(screen: K, params?: RootStackParamList[K]): void;
  replace<K extends keyof RootStackParamList>(screen: K, params?: RootStackParamList[K]): void;
};

// Screen props types
export type WelcomeScreenProps = {
  navigation: NavigationProp<'Welcome'>;
};

export type SeedPhraseDisplayScreenProps = {
  navigation: NavigationProp<'SeedPhraseDisplay'>;
  route: {
    params: RootStackParamList['SeedPhraseDisplay'];
  };
};

export type SeedPhraseVerifyScreenProps = {
  navigation: NavigationProp<'SeedPhraseVerify'>;
  route: {
    params: RootStackParamList['SeedPhraseVerify'];
  };
};

export type SeedPhraseBackupScreenProps = {
  navigation: NavigationProp<'SeedPhraseBackup'>;
};

export type CreatePasswordScreenProps = {
  navigation: NavigationProp<'CreatePassword'>;
  route: {
    params: RootStackParamList['CreatePassword'];
  };
};

export type WalletSuccessScreenProps = {
  navigation: NavigationProp<'WalletSuccess'>;
  route: {
    params: RootStackParamList['WalletSuccess'];
  };
};

export type ImportWalletScreenProps = {
  navigation: NavigationProp<'ImportWallet'>;
};

export type ImportMethodsScreenProps = {
  navigation: NavigationProp<'ImportMethods'>;
};

export type ImportSeedPhraseScreenProps = {
  navigation: NavigationProp<'ImportSeedPhrase'>;
};

export type ImportPrivateKeyScreenProps = {
  navigation: NavigationProp<'ImportPrivateKey'>;
};

export type UnlockScreenProps = {
  navigation: NavigationProp<'Unlock'>;
};

export type HomeScreenProps = {
  navigation: NavigationProp<'Home'>;
};

export type SettingsScreenProps = {
  navigation: NavigationProp<'Settings'>;
};
