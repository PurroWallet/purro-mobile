import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, View } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import './global.css';

// Disable DevTools to prevent crypto polyfill issues
if (__DEV__) {
  // @ts-ignore
  globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__?.shutdown?.();
}

import { BackgroundSecureBlurView } from '@/components/customized/BlurViews';
import { PrivacyBlur } from '@/components/PrivacyBlur';
import { GlobalSecurityTipStubModal } from '@/components/SecurityTipStubModal';
import { apisWallet } from '@/core/apis';
import { useAppPreventScreenshotOnScreen } from '@/core/hooks/native/security';
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
  SeedPhraseBackupScreen,
  SeedPhraseDisplayScreen,
  SeedPhraseVerifyScreen,
  UnlockScreen,
  WalletSuccessScreen,
  WelcomeScreen,
} from '@/screens';
import { useAppStore } from '@/stores/appStore';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Configure QueryClient with memory-efficient defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Automatically remove inactive queries after 5 minutes
      gcTime: 1000 * 60 * 5,
      // Data becomes stale after 1 minute
      staleTime: 1000 * 60,
      // Don't retry failed requests automatically (mobile networks are unstable)
      retry: false,
      // Don't refetch on window focus (not applicable on mobile)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
  },
});

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
              <NavigationContainer>
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
