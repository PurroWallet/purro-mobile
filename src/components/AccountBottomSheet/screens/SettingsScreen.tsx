import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ChevronRight } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NavigationProp } from '@react-navigation/native';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';
import { useBiometrics } from '@/core/hooks/biometrics';
import { apisLock, apisWallet, apisKeychain } from '@/core/apis';
import { KEYCHAIN_AUTH_TYPES } from '@/core/services/keychain';
import { useAtom } from 'jotai';
import { walletExists } from '@/atoms/app';
import { useThemeMode } from '@/core/hooks/useTheme';
import type { ThemeMode } from '@/theme';
import { useTranslation } from '@/utils/i18n';

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
      <Text className={`text-lg font-semibold ${danger ? 'text-system-error' : 'text-text-primary'}`}>
        {title}
      </Text>
      {subtitle && (
        <Text className="mt-1 text-sm text-text-secondary">{subtitle}</Text>
      )}
    </View>
    {rightComponent ||
      (showArrow && (
        <ChevronRight size={20} color="rgb(var(--color-text-primary))" />
      ))}
  </TouchableOpacity>
);

// Section Header Component
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <View className="mt-6 mb-3">
    <Text className="text-sm font-semibold uppercase tracking-[1px] text-text-secondary">
      {title}
    </Text>
  </View>
);

const SettingsScreen: React.FC<Props> = ({ navigation, parentNavigation }) => {
  const [, setWalletExists] = useAtom(walletExists);
  const { t } = useTranslation();
  const {
    computed: { isBiometricsEnabled, defaultTypeLabel, couldSetupBiometrics },
    toggleBiometrics,
    fetchBiometrics,
  } = useBiometrics({ autoFetch: true });

  const { themeMode, setThemeMode } = useThemeMode();

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
            console.log('No existing keychain password');
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
            console.log('No existing keychain data to clear');
          }

          await apisKeychain.setGenericPassword(
            walletPassword,
            KEYCHAIN_AUTH_TYPES.BIOMETRICS,
          );

          await fetchBiometrics();

          Alert.alert(
            t('common.success'),
            t(
              'accountBottomSheet.settingsScreen.alerts.biometrics.enableSuccess',
              { method: defaultTypeLabel },
            ),
          );
        } catch (error) {
          console.error('Error enabling biometrics:', error);
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
          t(
            'accountBottomSheet.settingsScreen.alerts.biometrics.disableConfirmTitle',
            { method: defaultTypeLabel },
          ),
          t(
            'accountBottomSheet.settingsScreen.alerts.biometrics.disableConfirmMessage',
            { method: defaultTypeLabel },
          ),
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
                    t(
                      'accountBottomSheet.settingsScreen.alerts.biometrics.disableSuccessTitle',
                      { method: defaultTypeLabel },
                    ),
                    t(
                      'accountBottomSheet.settingsScreen.alerts.biometrics.disableSuccessMessage',
                      { method: defaultTypeLabel },
                    ),
                  );
                } catch (err) {
                  console.error('Error disabling biometrics:', err);
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
      console.error('Error toggling biometrics:', error);
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
    setThemeMode(nextMode);
  };

  const themeToggleOptions = useMemo(() => {
    const isDark = themeMode === 'dark';

    return {
      label: t(
        isDark
          ? 'accountBottomSheet.settingsScreen.theme.darkTitle'
          : 'accountBottomSheet.settingsScreen.theme.lightTitle',
      ),
      subtitle: t(
        isDark
          ? 'accountBottomSheet.settingsScreen.theme.lightSubtitle'
          : 'accountBottomSheet.settingsScreen.theme.darkSubtitle',
      ),
      nextMode: isDark ? 'light' : 'dark',
      value: isDark,
    };
  }, [themeMode, t]);

  const handleBackupWallet = () => {
    navigation.navigate('SeedPhraseBackup');
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
              console.log('🔄 Resetting wallet...');
              
              // Reset wallet data
              apisWallet.resetWallet();
              
              // Lock wallet
              await apisLock.lockWallet();
              
              // Clear keychain data
              try {
                await apisKeychain.resetGenericPassword();
                console.log('🔑 Keychain data cleared');
              } catch (error) {
                console.log('🔑 No keychain data to clear:', error);
              }
              
              // Update wallet exists state
              setWalletExists(false);
              
              console.log('✅ Wallet reset complete, navigating to Welcome screen');
              
              // Use parent navigation to reset to Welcome screen
              if (parentNavigation) {
                parentNavigation.reset({
                  index: 0,
                  routes: [{ name: 'Welcome' }],
                });
              }
            } catch (error) {
              console.error('Error resetting wallet:', error);
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
    <BottomSheetScrollView className="flex-1">
      {/* Header */}
      <SheetHeader
        title={t('accountBottomSheet.settingsScreen.headerTitle')}
        onBack={() => navigation.goBack()}
      />
      <View className="mb-4" />

      <ScrollView className="flex-1">
        {/* Security Section */}
        <View className="px-5">
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
              rightComponent={
                <View className="min-w-[51px] items-center justify-center pr-2">
                  <Switch
                    value={themeToggleOptions.value}
                    onValueChange={() =>
                      handleChangeTheme(themeToggleOptions.nextMode as ThemeMode)
                    }
                    trackColor={{
                      false: '#373B43',
                      true: '#059288',
                    }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              }
            />
          </View>
        </View>

        {/* Wallet Section */}
        <View className="px-5 mt-6">
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
        <View className="px-5 mt-6">
          <SectionHeader title={t('accountBottomSheet.settingsScreen.sections.about')} />
          <View className="gap-2">
            <SettingItem
              title={t('accountBottomSheet.settingsScreen.version.title')}
              subtitle={t('accountBottomSheet.settingsScreen.version.subtitle')}
              showArrow={false}
            />
            <SettingItem
              title={t('accountBottomSheet.settingsScreen.terms.title')}
              onPress={() => Alert.alert(
                t('accountBottomSheet.settingsScreen.terms.title'),
                t('accountBottomSheet.settingsScreen.terms.message'),
              )}
            />
            <SettingItem
              title={t('accountBottomSheet.settingsScreen.privacy.title')}
              onPress={() => Alert.alert(
                t('accountBottomSheet.settingsScreen.privacy.title'),
                t('accountBottomSheet.settingsScreen.privacy.message'),
              )}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View className="px-5 mt-6 pb-10">
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
      </ScrollView>
    </BottomSheetScrollView>
  );
};

export default SettingsScreen;