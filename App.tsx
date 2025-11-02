import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, View } from 'react-native';
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
import { apisWallet } from '@/core/apis/wallet';
import { useAppPreventScreenshotOnScreen } from '@/core/hooks/native/security';
import { screenProtection } from '@/core/services/screenProtection';
import { web3AuthService } from '@/core/services/Web3AuthService';
import { excludeFilesFromBackup } from '@/core/utils/appFS';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { useAppStore } from '@/stores/appStore';
import MainTabNavigator from './src/navigation/MainTabNavigator';
// CRITICAL: Polyfills are now loaded in index.js at the very top with proper order
import CreatePasswordScreen from './src/screens/CreatePasswordScreen';
import ImportMethodsScreen from './src/screens/ImportMethodsScreen';
import ImportPrivateKeyScreen from './src/screens/ImportPrivateKeyScreen';
import ImportSeedPhraseScreen from './src/screens/ImportSeedPhraseScreen';
import ImportWalletScreen from './src/screens/ImportWalletScreen';
import SeedPhraseBackupScreen from './src/screens/SeedPhraseBackupScreen';
import SeedPhraseDisplayScreen from './src/screens/SeedPhraseDisplayScreen';
import SeedPhraseVerifyScreen from './src/screens/SeedPhraseVerifyScreen';
import UnlockScreen from './src/screens/UnlockScreen';
import WalletSuccessScreen from './src/screens/WalletSuccessScreen';
// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';

import type { RootStackParamList } from './src/types/navigation';

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
    <KeyboardProvider>
      <GestureHandlerRootView className="flex-1">
        <BottomSheetModalProvider>
          <PrivacyBlur>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider>
                <NavigationContainer>
                  <StatusBar barStyle="light-content" backgroundColor="#161616" />
                  <Stack.Navigator
                    initialRouteName={initialRoute as keyof RootStackParamList}
                    screenOptions={{
                      headerShown: false,
                      animation: 'simple_push',
                      contentStyle: {
                        backgroundColor: '#161616',
                      },
                    }}
                  >
                    {/* Onboarding Flow */}
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen
                      name="SeedPhraseDisplay"
                      component={SeedPhraseDisplayScreen}
                      options={{
                        gestureEnabled: false, // Prevent swipe back on seed phrase screen
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
              </ThemeProvider>
            </QueryClientProvider>
          </PrivacyBlur>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
};

export default App;
