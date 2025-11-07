import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/Icon';
import ThemeToggle from '@/components/ThemeToggle';
import { apisKeychain, apisLock, apisWallet } from '@/core/apis';
import { useBiometrics } from '@/core/hooks/biometrics';
import { KEYCHAIN_AUTH_TYPES } from '@/core/services/keychain';
import { useAppStore } from '@/stores/appStore';
import type { ThemeMode } from '@/theme';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type Props = NativeStackScreenProps<AccountStackParamList, 'Settings'> & {
  parentNavigation: NavigationProp<any>;
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
const SettingItem: React.FC<SettingsOption> = ({
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightComponent,
  danger = false,
}) => (
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
    {rightComponent || (showArrow && <Icon name="ChevronRight" size={20} />)}
  </TouchableOpacity>
);

// Section Header Component
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <View className="">
    <Text className="text-sm font-semibold uppercase tracking-[1px] text-text-secondary mb-4">
      {title}
    </Text>
  </View>
);

const SettingsScreen: React.FC<Props> = ({ navigation, parentNavigation }) => {
  const setWalletExists = useAppStore((state) => state.setWalletExists);
  const { t } = useTranslation();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const {
    computed: { isBiometricsEnabled, defaultTypeLabel, couldSetupBiometrics },
    toggleBiometrics,
    fetchBiometrics,
  } = useBiometrics({ autoFetch: true });

  const [isEnablingBiometrics, setIsEnablingBiometrics] = useState(false);

  useEffect(() => {
    fetchBiometrics();
  }, [fetchBiometrics]);

  const handleBiometricToggle = async (value: boolean) => {
    if (isEnablingBiometrics) return;

    setIsEnablingBiometrics(true);

    try {
      if (value) {
        // Enable biometrics
        try {
          let walletPassword = null;
          try {
            walletPassword = await apisKeychain.requestGenericPassword();
          } catch {
            // Handle error silently
          }

          if (!walletPassword) {
            const { keyringService } = await import('@/core/services/KeyringService');

            if (!keyringService.isUnlocked()) {
              Alert.alert(
                t('errors.generic.title'),
                t('accountBottomSheet.settingsScreen.alerts.biometrics.unlockRequired'),
              );
              setIsEnablingBiometrics(false);
              return;
            }
            walletPassword = keyringService.getPassword();
          }

          if (!walletPassword) {
            Alert.alert(
              t('errors.generic.title'),
              t('accountBottomSheet.settingsScreen.alerts.biometrics.passwordMissing'),
            );
            setIsEnablingBiometrics(false);
            return;
          }

          try {
            await apisKeychain.resetGenericPassword();
          } catch {
            // Handle error silently
          }

          await apisKeychain.setGenericPassword(walletPassword, KEYCHAIN_AUTH_TYPES.BIOMETRICS);

          await fetchBiometrics();

          Alert.alert(
            t('common.success'),
            t('accountBottomSheet.settingsScreen.alerts.biometrics.enableSuccess', {
              method: defaultTypeLabel,
            }),
          );
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
    Alert.alert(
      t('accountBottomSheet.settingsScreen.alerts.changePassword.title'),
      t('accountBottomSheet.settingsScreen.alerts.changePassword.message'),
      [{ text: t('common.ok'), style: 'default' }],
    );
  };

  const handleChangeTheme = (nextMode: ThemeMode) => {
    setColorScheme(nextMode);
  };

  const themeToggleOptions = useMemo(() => {
    return {
      label: t(
        isDarkMode
          ? 'accountBottomSheet.settingsScreen.theme.darkTitle'
          : 'accountBottomSheet.settingsScreen.theme.lightTitle',
      ),
      subtitle: t(
        isDarkMode
          ? 'accountBottomSheet.settingsScreen.theme.lightSubtitle'
          : 'accountBottomSheet.settingsScreen.theme.darkSubtitle',
      ),
      nextMode: isDarkMode ? 'light' : 'dark',
      value: isDarkMode,
    };
  }, [isDarkMode, t]);

  const handleBackupWallet = () => {
    // Navigate to SelectSeedPhrase with backup mode
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
          onPress: async () => {
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
        },
      ],
    );
  };

  return (
    <BaseScreen
      title={t('accountBottomSheet.settingsScreen.headerTitle')}
      showBackButton={true}
      onBack={() => navigation.goBack()}
      isScrollable={true}
      contentContainerStyle={{
        paddingHorizontal: 20,
      }}
    >
      <BottomSheetScrollView className="w-full" contentContainerClassName="">
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
              subtitle={themeToggleOptions.subtitle}
              onPress={() => handleChangeTheme(themeToggleOptions.nextMode as ThemeMode)}
              rightComponent={<ThemeToggle />}
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
                Alert.alert(
                  t('accountBottomSheet.settingsScreen.terms.title'),
                  t('accountBottomSheet.settingsScreen.terms.message'),
                )
              }
            />
            <SettingItem
              title={t('accountBottomSheet.settingsScreen.privacy.title')}
              onPress={() =>
                Alert.alert(
                  t('accountBottomSheet.settingsScreen.privacy.title'),
                  t('accountBottomSheet.settingsScreen.privacy.message'),
                )
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
