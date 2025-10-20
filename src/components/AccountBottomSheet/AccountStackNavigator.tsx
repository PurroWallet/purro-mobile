import type { NavigationProp } from '@react-navigation/native';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import React, { useMemo } from 'react';
import AccountListScreen from './screens/AccountListScreen.tsx';
import AddAccountScreen from './screens/AddAccountScreen.tsx';
import CreatePasswordScreen from './screens/CreatePasswordScreen.tsx';
import EditAccountNameScreen from './screens/EditAccountNameScreen.tsx';
import EditAccountScreen from './screens/EditAccountScreen.tsx';
import ImportPrivateKeyScreen from './screens/ImportPrivateKeyScreen.tsx';
import ImportSeedPhraseScreen from './screens/ImportSeedPhraseScreen.tsx';
import PasswordVerificationScreen from './screens/PasswordVerificationScreen.tsx';
import SeedPhraseBackupScreen from './screens/SeedPhraseBackupScreen.tsx';
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
  SeedPhraseBackup: undefined;
  CreatePassword: { mnemonic: string; isPrivateKeyImport?: boolean; isNewAccount?: boolean };
  Success: { title: string; message: string; buttonText?: string };
  PasswordVerification: { accountAddress: string; onSuccess: () => void };
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
  navigation: NavigationProp<any>;
  onResetWallet?: () => void;
}

const AccountStackNavigator: React.FC<AccountStackNavigatorProps> = ({
  onClose,
  currentAccount,
  onAccountSelect,
  navigation: parentNavigation,
  onResetWallet: _onResetWallet,
}) => {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const screenOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      headerShown: false,
      contentStyle: {
        // Sử dụng màu từ theme thay vì hardcode
        backgroundColor: isDarkMode ? 'rgb(22 22 22)' : 'rgb(249 250 251)',
      },
      animation: 'slide_from_right',
      gestureEnabled: true,
      fullScreenGestureEnabled: true,
    }),
    [isDarkMode],
  );

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="AccountList">
            {(props) => (
              <AccountListScreen
                {...props}
                onClose={onClose}
                currentAccount={currentAccount}
                onAccountSelect={onAccountSelect}
                parentNavigation={parentNavigation}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="AddAccount">
            {(props) => (
              <AddAccountScreen {...props} onClose={onClose} parentNavigation={parentNavigation} />
            )}
          </Stack.Screen>
          <Stack.Screen name="ImportSeedPhrase">
            {(props) => (
              <ImportSeedPhraseScreen
                {...props}
                onClose={onClose}
                parentNavigation={parentNavigation}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ImportPrivateKey">
            {(props) => (
              <ImportPrivateKeyScreen
                {...props}
                onClose={onClose}
                parentNavigation={parentNavigation}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="SeedPhraseBackup">
            {(props) => <SeedPhraseBackupScreen {...props} onClose={onClose} />}
          </Stack.Screen>
          <Stack.Screen name="CreatePassword">
            {(props) => (
              <CreatePasswordScreen
                {...props}
                onClose={onClose}
                parentNavigation={parentNavigation}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Unlock">
            {(props) => (
              <UnlockScreen {...props} onClose={onClose} parentNavigation={parentNavigation} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Success">
            {(props) => <SuccessScreen {...props} onClose={onClose} />}
          </Stack.Screen>
          <Stack.Screen name="PasswordVerification">
            {(props) => <PasswordVerificationScreen {...props} onClose={onClose} />}
          </Stack.Screen>
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
