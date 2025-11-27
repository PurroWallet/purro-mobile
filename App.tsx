import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import type { LinkingOptions } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, View } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import './global.css';

import { BackgroundSecureBlurView } from '@/components/customized/BlurViews';
import { PrivacyBlur } from '@/components/PrivacyBlur';
import { GlobalSecurityTipStubModal } from '@/components/SecurityTipStubModal';
import { apisWallet } from '@/core/apis';
import { useAppPreventScreenshotOnScreen } from '@/core/hooks/native/security';
import { queryClient } from '@/core/query/queryClient';
import { screenProtection } from '@/core/services/screenProtection';
import { web3AuthService } from '@/core/services/Web3AuthService';
import { excludeFilesFromBackup } from '@/core/utils/appFS';
import MainTabNavigator from '@/navigation/MainTabNavigator';
import {
  CreatePasswordScreen,
  ImportMethodsScreen,
  ImportPrivateKeyScreen,
  ImportSeedPhraseScreen,
  ImportWalletScreen,
  SearchScreen,
  SeedPhraseBackupScreen,
  SeedPhraseDisplayScreen,
  SeedPhraseVerifyScreen,
  UnlockScreen,
  WalletSuccessScreen,
  WelcomeScreen,
} from '@/screens';
import WebViewScreen from '@/screens/Settings/WebViewScreen';
import { useAppStore } from '@/stores/appStore';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Configure deep linking
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['purrowallet://', 'https://purrowallet.com'],
  config: {
    screens: {
      Welcome: 'welcome',
      Unlock: 'unlock',
      Home: {
        path: 'home',
        screens: {
          HomeMain: 'wallet',
          Swap: 'swap',
          Nft: 'nft',
          History: 'history',
        },
      },
      SearchScreen: 'search',
      SeedPhraseDisplay: 'seed-phrase-display',
      SeedPhraseVerify: 'seed-phrase-verify',
      SeedPhraseBackup: 'seed-phrase-backup',
      CreatePassword: 'create-password',
      WalletSuccess: 'wallet-success',
      ImportWallet: 'import-wallet',
      ImportMethods: 'import-methods',
      ImportSeedPhrase: 'import-seed-phrase',
      ImportPrivateKey: 'import-private-key',
    },
  },
};

const App: React.FC = () => {
  const { setRoute, setWalletExists, setWalletUnlocked } = useAppStore();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useAppPreventScreenshotOnScreen({ isTop: true });

  useEffect(() => {
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle('light-content', true);
    }

    screenProtection.init();
    web3AuthService.initialize().catch(() => {});
    excludeFilesFromBackup().catch(() => {});

    try {
      const hasWallet = apisWallet.hasWallet();
      setWalletExists(hasWallet);

      let decidedRoute: string = 'Welcome';

      if (hasWallet) {
        const isLocked = apisWallet.isLocked();
        setWalletUnlocked(!isLocked);
        decidedRoute = isLocked ? 'Unlock' : 'Home';
      }

      setRoute(decidedRoute);
      setInitialRoute(decidedRoute);
    } catch (error) {
      setRoute('Welcome');
      setInitialRoute('Welcome');
    }

    return () => {
      screenProtection.cleanup();
    };
  }, [setRoute, setWalletExists, setWalletUnlocked]);

  useEffect(() => {
    if (initialRoute !== null) {
      BootSplash.hide({ fade: true }).catch(() => {});
    }
  }, [initialRoute]);

  if (initialRoute === null) {
    return (
      <PrivacyBlur>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </PrivacyBlur>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <KeyboardProvider>
        <BottomSheetModalProvider>
          <PrivacyBlur>
            <QueryClientProvider client={queryClient}>
              <NavigationContainer linking={linking}>
                <StatusBar barStyle="light-content" backgroundColor="#161616" />
                <Stack.Navigator
                  initialRouteName={initialRoute as keyof RootStackParamList}
                  screenOptions={{
                    headerShown: false,
                    animation: 'simple_push',
                  }}
                >
                  {/* Onboarding Flow */}
                  <Stack.Screen name="Welcome" component={WelcomeScreen} />
                  <Stack.Screen
                    name="SeedPhraseDisplay"
                    component={SeedPhraseDisplayScreen}
                    options={{
                      gestureEnabled: false,
                    }}
                  />
                  <Stack.Screen
                    name="SeedPhraseVerify"
                    component={SeedPhraseVerifyScreen}
                    options={{
                      gestureEnabled: false,
                    }}
                  />
                  <Stack.Screen
                    name="CreatePassword"
                    component={CreatePasswordScreen}
                    options={{
                      gestureEnabled: false,
                    }}
                  />
                  <Stack.Screen
                    name="WalletSuccess"
                    component={WalletSuccessScreen}
                    options={{
                      gestureEnabled: false,
                    }}
                  />
                  {/* Auth Flow */}
                  <Stack.Screen
                    name="Unlock"
                    component={UnlockScreen}
                    options={{
                      gestureEnabled: false, // Prevent swipe back on unlock screen
                    }}
                  />

                  {/* Import Flow */}
                  <Stack.Screen name="ImportMethods" component={ImportMethodsScreen} />
                  <Stack.Screen name="ImportSeedPhrase" component={ImportSeedPhraseScreen} />
                  <Stack.Screen name="ImportPrivateKey" component={ImportPrivateKeyScreen} />
                  <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />

                  {/* Backup Flow */}
                  <Stack.Screen name="SeedPhraseBackup" component={SeedPhraseBackupScreen} />

                  {/* Main App Flow */}
                  <Stack.Screen name="Home" component={MainTabNavigator} />
                  <Stack.Screen name="SearchScreen" component={SearchScreen} />
                  <Stack.Screen name="WebView" component={WebViewScreen} />
                </Stack.Navigator>

                {/* Screenshot protection components (Rabby pattern) */}
                <BackgroundSecureBlurView />
                <GlobalSecurityTipStubModal />
              </NavigationContainer>
            </QueryClientProvider>
          </PrivacyBlur>
        </BottomSheetModalProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};

export default App;
