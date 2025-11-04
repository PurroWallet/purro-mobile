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

  // Import reset vault utility for debugging
  import('@/utils/resetVault').catch(() => {});
}

// Screenshot protection components (Rabby pattern)
import { BackgroundSecureBlurView } from '@/components/customized/BlurViews';
import { PrivacyBlur } from '@/components/PrivacyBlur';
import { GlobalSecurityTipStubModal } from '@/components/SecurityTipStubModal';
import { ThemeWrapper } from '@/components/ThemeWrapper';
import { apisWallet } from '@/core/apis/wallet';
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
const queryClient = new QueryClient();

const App: React.FC = () => {
  const { setRoute, setWalletExists, setWalletUnlocked } = useAppStore();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // Screenshot prevention (Rabby pattern)
  useAppPreventScreenshotOnScreen({ isTop: true });

  // Initialize app on mount - OPTIMIZED
  useEffect(() => {
    // Set status bar style (non-blocking)
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle('light-content', true);
    }

    // Initialize screen protection service
    screenProtection.init();

    // Initialize Web3Auth v8.1.0 service synchronously (only once)
    web3AuthService.initialize().catch(() => {
      // Handle initialization error silently
    });

    // Exclude sensitive files from backup (iOS)
    excludeFilesFromBackup().catch(() => {
      // Handle backup exclusion error silently
    });

    // Determine initial route BEFORE rendering navigator to avoid race with
    // React Navigation's `initialRouteName` semantics. This keeps logic
    // deterministic and avoids imperative navigation hacks.
    try {
      const hasWallet = apisWallet.hasWallet();
      setWalletExists(hasWallet);

      let decidedRoute: string = 'Welcome';

      if (hasWallet) {
        const isLocked = apisWallet.isLocked();
        setWalletUnlocked(!isLocked);

        decidedRoute = isLocked ? 'Unlock' : 'Home';
      } else {
        decidedRoute = 'Welcome';
      }

      setRoute(decidedRoute);
      setInitialRoute(decidedRoute);
    } catch (error) {
      setRoute('Welcome');
      setInitialRoute('Welcome');
    }

    // Cleanup on unmount
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
              <ThemeWrapper>
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
              </ThemeWrapper>
            </QueryClientProvider>
          </PrivacyBlur>
        </BottomSheetModalProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};

export default App;
