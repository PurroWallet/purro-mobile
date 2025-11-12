import type { NavigationProp } from '@react-navigation/native';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import type { RootStackParamList } from '@/types/navigation';
import AccountListScreen from './screens/AccountListScreen.tsx';
import AddAccountScreen from './screens/AddAccountScreen.tsx';
import CreatePasswordScreen from './screens/CreatePasswordScreen.tsx';
import EditAccountNameScreen from './screens/EditAccountNameScreen.tsx';
import EditAccountScreen from './screens/EditAccountScreen.tsx';
import ImportPrivateKeyScreen from './screens/ImportPrivateKeyScreen.tsx';
import ImportSeedPhraseScreen from './screens/ImportSeedPhraseScreen.tsx';
import PasswordVerificationScreen from './screens/PasswordVerificationScreen.tsx';
import PrivateKeyDisplayScreen from './screens/PrivateKeyDisplayScreen.tsx';
import SeedPhraseBackupScreen from './screens/SeedPhraseBackupScreen.tsx';
import SeedPhraseDiscoveryScreen from './screens/SeedPhraseDiscoveryScreen.tsx';
import SelectSeedPhraseScreen from './screens/SelectSeedPhraseScreen.tsx';
import SettingsScreen from './screens/SettingsScreen.tsx';
import SuccessScreen from './screens/SuccessScreen.tsx';
import UnlockScreen from './screens/UnlockScreen.tsx';

export type AccountStackParamList = {
  AccountList: undefined;
  AddAccount: undefined;
  EditAccount: { accountAddress: string };
  EditAccountName: { accountAddress: string; currentName: string };
  Settings: undefined;
  ImportSeedPhrase: undefined;
  ImportPrivateKey: undefined;
  PrivateKeyDisplay: {
    privateKey: string;
    accountAddress: string;
  };
  SeedPhraseBackup: undefined;
  SeedPhraseDiscovery: {
    mnemonic: string;
    password: string;
    onSuccess?: (account: any) => void;
  };
  SelectSeedPhrase: {
    mode?: 'create' | 'backup';
    onSeedPhraseSelected?: (keyringInfo: any) => void;
  };
  CreatePassword: { mnemonic: string; isPrivateKeyImport?: boolean; isNewAccount?: boolean };
  Success: { title: string; message: string; buttonText?: string };
  PasswordVerification: { accountAddress: string; onSuccess: (password: string) => void };
  Unlock: {
    mnemonic?: string;
    isImport?: boolean;
    isPrivateKeyImport?: boolean;
    isNewAccount?: boolean;
  };
};

const Stack = createNativeStackNavigator<AccountStackParamList>();

interface AccountStackNavigatorProps {
  onClose: () => void;
  currentAccount: any;
  onAccountSelect: (account: any) => void;
  parentNavigation?: NavigationProp<RootStackParamList>;
  onAddAccount?: () => void;
  onSettings?: () => void;
}

const AccountStackNavigator: React.FC<AccountStackNavigatorProps> = ({
  onClose,
  currentAccount,
  onAccountSelect,
  parentNavigation,
  onAddAccount,
  onSettings,
}) => {
  const screenOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      headerShown: false,
      contentStyle: {
        backgroundColor: 'transparent',
      },
      animation: 'slide_from_right',
      gestureEnabled: true,
      fullScreenGestureEnabled: true,
    }),
    [],
  );

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator screenOptions={screenOptions} initialRouteName="AccountList">
          <Stack.Screen name="AccountList">
            {(props) => (
              <AccountListScreen
                {...props}
                onClose={onClose}
                currentAccount={currentAccount}
                onAccountSelect={onAccountSelect}
                onAddAccount={onAddAccount}
                onSettings={onSettings}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="AddAccount">
            {(props) => <AddAccountScreen {...props} onClose={onClose} />}
          </Stack.Screen>
          <Stack.Screen name="ImportSeedPhrase">
            {(props) => <ImportSeedPhraseScreen {...props} onClose={onClose} />}
          </Stack.Screen>
          <Stack.Screen name="ImportPrivateKey">
            {(props) => <ImportPrivateKeyScreen {...props} onClose={onClose} />}
          </Stack.Screen>
          <Stack.Screen name="SeedPhraseBackup">
            {(props) => <SeedPhraseBackupScreen {...props} onClose={onClose} />}
          </Stack.Screen>
          <Stack.Screen name="PrivateKeyDisplay">
            {(props) => (
              <PrivateKeyDisplayScreen
                privateKey={props.route.params.privateKey}
                accountAddress={props.route.params.accountAddress}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="SeedPhraseDiscovery">
            {(props) => (
              <SeedPhraseDiscoveryScreen
                mnemonic={props.route.params.mnemonic}
                password={props.route.params.password}
                onSuccess={props.route.params.onSuccess}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="SelectSeedPhrase">
            {(props) => (
              <SelectSeedPhraseScreen
                mode={props.route.params.mode}
                onSeedPhraseSelected={props.route.params.onSeedPhraseSelected}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="CreatePassword">
            {(props) => <CreatePasswordScreen {...props} onClose={onClose} />}
          </Stack.Screen>
          <Stack.Screen name="Unlock">
            {(props) => <UnlockScreen {...props} onClose={onClose} />}
          </Stack.Screen>
          <Stack.Screen name="Success">
            {(props) => <SuccessScreen {...props} onClose={onClose} />}
          </Stack.Screen>
          <Stack.Screen name="PasswordVerification" component={PasswordVerificationScreen} />
          <Stack.Screen name="EditAccount" component={EditAccountScreen} />
          <Stack.Screen name="EditAccountName" component={EditAccountNameScreen} />
          <Stack.Screen name="Settings">
            {(props) => <SettingsScreen {...props} parentNavigation={parentNavigation} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};

export default AccountStackNavigator;
