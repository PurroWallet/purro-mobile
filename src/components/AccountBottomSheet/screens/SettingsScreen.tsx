import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { Alert, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/Icon';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { apisKeychain, apisLock, apisWallet } from '@/core/apis';
import { useBiometrics } from '@/core/hooks/biometrics';
import { useThemeMode } from '@/core/hooks/useTheme';
import { KEYCHAIN_AUTH_TYPES } from '@/core/services/keychain';
import { useAppStore } from '@/stores/appStore';
import type { RootStackParamList } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type Props = {
  parentNavigation?: NavigationProp<RootStackParamList>;
};

interface SettingsOption {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
  danger?: boolean;
}

// Setting Item Component
const SettingItem: React.FC<SettingsOption> = memo(
  ({ title, subtitle, onPress, showArrow = true, rightComponent, danger = false }) => (
    <TouchableOpacity
      className={`flex-row items-center justify-between rounded-xl px-4 py-4 ${
        danger ? 'bg-system-error/10' : 'bg-background-secondary/60'
      }`}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View className="flex-1">
        <Text
          className={`text-lg font-semibold ${danger ? 'text-system-error' : 'text-text-primary'}`}
        >
          {title}
        </Text>
        {subtitle && <Text className="mt-1 text-sm text-text-secondary">{subtitle}</Text>}
      </View>
      {rightComponent || (showArrow && <Icon name="ChevronRight" size={16} />)}
    </TouchableOpacity>
  ),
);

// Section Header Component
const SectionHeader: React.FC<{ title: string }> = memo(({ title }) => (
  <View className="">
    <Text className="text-sm font-semibold uppercase tracking-[1px] text-text-secondary mb-4">
      {title}
    </Text>
  </View>
));

const SettingsScreen: React.FC<Props> = ({ parentNavigation }) => {
  const navigation = useNavigation<NativeStackNavigationProp<AccountStackParamList, 'Settings'>>();
  const setWalletExists = useAppStore((state) => state.setWalletExists);
  const { t, i18n } = useTranslation();
  const { themeMode } = useThemeMode();
  const isDarkMode = themeMode === 'dark';
  const {
    computed: { isBiometricsEnabled, defaultTypeLabel, couldSetupBiometrics },
    toggleBiometrics,
    fetchBiometrics,
  } = useBiometrics({ autoFetch: true });

  const [isEnablingBiometrics, setIsEnablingBiometrics] = useState(false);

  useEffect(() => {
    fetchBiometrics();
  }, []);

  const handleBiometricToggle = async (value: boolean) => {
    if (isEnablingBiometrics) return;

    setIsEnablingBiometrics(true);

    try {
      if (value) {
        // Enable biometrics
        try {
          // Navigate to password verification to get the wallet password
          navigation.navigate('PasswordVerification', {
            accountAddress: '',
            onSuccess: async (verifiedPassword) => {
              try {
                await apisKeychain.resetGenericPassword();
              } catch (e) {
                // Handle error silently
              }

              await apisKeychain.setGenericPassword(
                verifiedPassword,
                KEYCHAIN_AUTH_TYPES.BIOMETRICS,
              );

              await fetchBiometrics();

              // Immediately prompt for biometric verification to confirm enrollment
              await apisKeychain.requestGenericPassword();
              // Successfully enabled biometrics, go back to settings
              navigation.goBack();
            },
          });
          setIsEnablingBiometrics(false);
          return;
        } catch (error) {
          Alert.alert(
            t('errors.generic.title'),
            t('accountBottomSheet.settingsScreen.alerts.biometrics.enableError'),
          );
        } finally {
          setIsEnablingBiometrics(false);
        }
      } else {
        // Disable biometrics
        Alert.alert(
          t('accountBottomSheet.settingsScreen.alerts.biometrics.disableConfirmTitle', {
            method: defaultTypeLabel,
          }),
          t('accountBottomSheet.settingsScreen.alerts.biometrics.disableConfirmMessage', {
            method: defaultTypeLabel,
          }),
          [
            {
              text: t('common.cancel'),
              style: 'cancel',
              onPress: () => setIsEnablingBiometrics(false),
            },
            {
              text: t('accountBottomSheet.settingsScreen.alerts.biometrics.disableButton'),
              style: 'destructive',
              onPress: async () => {
                try {
                  await toggleBiometrics(false, {});
                  await fetchBiometrics();
                  setIsEnablingBiometrics(false);

                  Alert.alert(
                    t('accountBottomSheet.settingsScreen.alerts.biometrics.disableSuccessTitle', {
                      method: defaultTypeLabel,
                    }),
                    t('accountBottomSheet.settingsScreen.alerts.biometrics.disableSuccessMessage', {
                      method: defaultTypeLabel,
                    }),
                  );
                } catch (err) {
                  Alert.alert(
                    t('errors.generic.title'),
                    t('accountBottomSheet.settingsScreen.alerts.biometrics.disableError'),
                  );
                  setIsEnablingBiometrics(false);
                }
              },
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert(
        t('errors.generic.title'),
        t('accountBottomSheet.settingsScreen.alerts.biometrics.updateError'),
      );
      setIsEnablingBiometrics(false);
    }
  };

  const handleChangePassword = () => {
    navigation.navigate('PasswordVerification', {
      accountAddress: '',
      onSuccess: async (verifiedPassword) => {
        // Navigate to change password screen with verified old password
        navigation.navigate('ChangePasswordScreen', {
          currentPassword: verifiedPassword,
        });
      },
    });
  };

  const themeSubtitle = useMemo(
    () =>
      t(
        isDarkMode
          ? 'accountBottomSheet.settingsScreen.theme.lightSubtitle'
          : 'accountBottomSheet.settingsScreen.theme.darkSubtitle',
      ),
    [isDarkMode, t],
  );

  const languageSubtitle = useMemo(
    () => (i18n.language === 'vi' ? 'Tiếng Việt' : 'English'),
    [i18n.language],
  );

  const handleBackupWallet = () => {
    // Show list of seed phrases first, user will select then enter password
    navigation.navigate('SelectSeedPhrase', { mode: 'backup' });
  };

  const handleResetWallet = () => {
    Alert.alert(
      t('accountBottomSheet.settingsScreen.alerts.resetWallet.title'),
      t('accountBottomSheet.settingsScreen.alerts.resetWallet.message'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('accountBottomSheet.settingsScreen.alerts.resetWallet.confirm'),
          style: 'destructive',
          onPress: () => {
            // Require password verification before resetting wallet
            navigation.navigate('PasswordVerification', {
              accountAddress: '',
              onSuccess: async (verifiedPassword) => {
                try {
                  // Reset wallet data
                  apisWallet.resetWallet();

                  // Lock wallet
                  await apisLock.lockWallet();

                  // Clear keychain data
                  try {
                    await apisKeychain.resetGenericPassword();
                  } catch (error) {
                    // Handle error silently
                  }

                  // Update wallet exists state
                  setWalletExists(false);

                  // Use parent navigation to reset to Welcome screen
                  if (parentNavigation) {
                    parentNavigation.reset({
                      index: 0,
                      routes: [{ name: 'Welcome' }],
                    });
                  }
                } catch (error) {
                  Alert.alert(
                    t('errors.generic.title'),
                    t('accountBottomSheet.settingsScreen.alerts.resetWallet.error'),
                  );
                }
              },
            });
          },
        },
      ],
    );
  };

  return (
    <BaseScreen
      title={t('accountBottomSheet.settingsScreen.headerTitle')}
      showBackButton={true}
      onBack={() => navigation.goBack()}
      isScrollable={false}
    >
      <BottomSheetScrollView
        className="w-full"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Section */}
        <View className="mb-4">
          <SectionHeader title={t('accountBottomSheet.settingsScreen.sections.security')} />
          <View className="gap-2">
            {couldSetupBiometrics && (
              <SettingItem
                title={t('accountBottomSheet.settingsScreen.biometrics.title', {
                  method: defaultTypeLabel,
                })}
                subtitle={
                  isBiometricsEnabled
                    ? t('accountBottomSheet.settingsScreen.biometrics.enabledSubtitle', {
                        method: defaultTypeLabel,
                      })
                    : t('accountBottomSheet.settingsScreen.biometrics.disabledSubtitle', {
                        method: defaultTypeLabel,
                      })
                }
                showArrow={false}
                onPress={() => handleBiometricToggle(!isBiometricsEnabled)}
                rightComponent={
                  <View className="min-w-[51px] items-center justify-center pr-2">
                    <Switch
                      value={isBiometricsEnabled}
                      onValueChange={handleBiometricToggle}
                      trackColor={{
                        false: '#373B43',
                        true: '#059288',
                      }}
                      thumbColor="#FFFFFF"
                      disabled={isEnablingBiometrics}
                    />
                  </View>
                }
              />
            )}
            <SettingItem
              title={t('settings.changePassword')}
              subtitle={t('accountBottomSheet.settingsScreen.changePasswordSubtitle')}
              onPress={handleChangePassword}
            />
            <SettingItem
              title={t('accountBottomSheet.settingsScreen.theme.title')}
              subtitle={themeSubtitle}
              showArrow={false}
              rightComponent={<ThemeToggle />}
            />
            <SettingItem
              title={t('accountBottomSheet.settingsScreen.language.title')}
              subtitle={languageSubtitle}
              showArrow={false}
              rightComponent={<LanguageToggle />}
            />
          </View>
        </View>

        {/* Wallet Section */}
        <View className="mb-4">
          <SectionHeader title={t('accountBottomSheet.settingsScreen.sections.wallet')} />
          <View className="gap-2">
            <SettingItem
              title={t('accountBottomSheet.backupWallet')}
              subtitle={t('accountBottomSheet.backupWalletDescription')}
              onPress={handleBackupWallet}
            />
          </View>
        </View>

        {/* About Section */}
        <View className="mb-4">
          <SectionHeader title={t('accountBottomSheet.settingsScreen.sections.about')} />
          <View className="gap-2">
            <SettingItem
              title={t('accountBottomSheet.settingsScreen.version.title')}
              subtitle={t('accountBottomSheet.settingsScreen.version.subtitle')}
              showArrow={false}
            />
            <SettingItem
              title={t('accountBottomSheet.settingsScreen.terms.title')}
              onPress={() =>
                navigation.navigate('WebView', {
                  url: 'https://purro.xyz/terms/',
                  title: 'Terms of Service',
                })
              }
            />
            <SettingItem
              title={t('accountBottomSheet.settingsScreen.privacy.title')}
              onPress={() =>
                navigation.navigate('WebView', {
                  url: 'https://purro.xyz/privacy/',
                  title: 'Privacy Policy',
                })
              }
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View className="pb-10">
          <SectionHeader title={t('accountBottomSheet.settingsScreen.sections.danger')} />
          <View className="gap-2">
            <SettingItem
              title={t('accountBottomSheet.settingsScreen.reset.title')}
              subtitle={t('accountBottomSheet.settingsScreen.reset.subtitle')}
              onPress={handleResetWallet}
              danger={true}
            />
          </View>
        </View>
      </BottomSheetScrollView>
    </BaseScreen>
  );
};

export default SettingsScreen;
