import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type React from "react";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StatusBar, View } from "react-native";
import "react-native-gesture-handler";
import "./global.css";

import { useAtom } from "jotai";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { currentRoute, walletExists, walletUnlocked } from "@/atoms/app";
// Screenshot protection components (Rabby pattern)
import { BackgroundSecureBlurView } from "@/components/customized/BlurViews";
import { PrivacyBlur } from "@/components/PrivacyBlur";
import { GlobalSecurityTipStubModal } from "@/components/SecurityTipStubModal";
import { apisWallet } from "@/core/apis/wallet";
import { screenProtection } from "@/core/services/screenProtection";
import { excludeFilesFromBackup } from "@/core/utils/appFS";
import { useAppPreventScreenshotOnScreen } from "@/hooks/native/security";
import CreatePasswordScreen from "./src/screens/CreatePasswordScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SeedPhraseDisplayScreen from "./src/screens/SeedPhraseDisplayScreen";
import SeedPhraseVerifyScreen from "./src/screens/SeedPhraseVerifyScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import UnlockScreen from "./src/screens/UnlockScreen";
import WalletSuccessScreen from "./src/screens/WalletSuccessScreen";
// Import screens
import WelcomeScreen from "./src/screens/WelcomeScreen";
import type { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [_route, setRoute] = useAtom(currentRoute);
  const [, setWalletExists] = useAtom(walletExists);
  const [, setWalletUnlocked] = useAtom(walletUnlocked);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // Screenshot prevention (Rabby pattern)
  useAppPreventScreenshotOnScreen({ isTop: true });

  // Initialize app on mount - OPTIMIZED
  useEffect(() => {
    console.log("[App] Initializing app...");
    const startTime = Date.now();

    // Set status bar style (non-blocking)
    if (Platform.OS === "ios") {
      StatusBar.setBarStyle("light-content", true);
    }

    // Initialize screen protection service
    screenProtection.init();

    // Exclude sensitive files from backup (iOS)
    excludeFilesFromBackup().catch((error) => {
      console.warn("[App] Failed to exclude files from backup:", error);
    });

    // Determine initial route BEFORE rendering navigator to avoid race with
    // React Navigation's `initialRouteName` semantics. This keeps logic
    // deterministic and avoids imperative navigation hacks.
    try {
      const hasWallet = apisWallet.hasWallet();
      setWalletExists(hasWallet);

      let decidedRoute: string = "Welcome";

      if (hasWallet) {
        const isLocked = apisWallet.isLocked();
        setWalletUnlocked(!isLocked);

        decidedRoute = isLocked ? "Unlock" : "Home";
      } else {
        decidedRoute = "Welcome";
      }

      setRoute(decidedRoute);
      setInitialRoute(decidedRoute);
    } catch (error) {
      console.error("[App] Initialization error:", error);
      setRoute("Welcome");
      setInitialRoute("Welcome");
    }

    console.log(`[App] Initialization took ${Date.now() - startTime}ms`);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <PrivacyBlur>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#161616" />
            <Stack.Navigator
              initialRouteName={initialRoute as keyof RootStackParamList}
              screenOptions={{
                headerShown: false,
                animation: "simple_push",
                contentStyle: {
                  backgroundColor: "#161616",
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

              {/* Main App Flow */}
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
          </NavigationContainer>

          {/* Screenshot protection components (Rabby pattern) */}
          <BackgroundSecureBlurView />
          <GlobalSecurityTipStubModal />
        </PrivacyBlur>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};

export default App;
