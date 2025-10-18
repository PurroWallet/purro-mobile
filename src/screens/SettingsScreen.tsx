import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useTranslation } from '@/utils/i18n';
import { useBiometrics } from '@/hooks/biometrics';
import { apisLock, apisWallet, apisKeychain } from '@/core/apis';
import { KEYCHAIN_AUTH_TYPES } from '@/core/services/keychain';
import { useAtom } from 'jotai';
import { walletExists } from '@/atoms/app';
import type { SettingsScreenProps } from '@/types/navigation';
import { Icon } from '@/components/Icon';

// Setting Item Component
interface SettingItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightComponent,
}) => (
  <TouchableOpacity
    className="flex-row items-center justify-between rounded-xl bg-background-secondary px-4 py-4"
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.8 : 1}
  >
    <View className="flex-1">
      <Text className="text-[16px] font-semibold text-text-primary">
        {title}
      </Text>
      {subtitle && (
        <Text className="mt-1 text-label text-text-secondary">{subtitle}</Text>
      )}
    </View>
    {rightComponent ||
      (showArrow && (
        <Icon name="ChevronRight" size={20} color={Colors.brand.primary} />
      ))}
  </TouchableOpacity>
);

// Section Header Component
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <View className="mt-8 mb-3 px-5">
    <Text className="text-[14px] font-semibold uppercase tracking-[1px] text-text-secondary">
      {title}
    </Text>
  </View>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  useTranslation();
  const [, setWalletExists] = useAtom(walletExists);
  const {
    computed: { isBiometricsEnabled, defaultTypeLabel, couldSetupBiometrics },
    toggleBiometrics,
    fetchBiometrics,
    biometrics,
  } = useBiometrics({ autoFetch: true });

  console.log('⚙️ Settings - Biometrics state:', {
    isBiometricsEnabled,
    defaultTypeLabel,
    couldSetupBiometrics,
    supportedBiometryType: biometrics.supportedBiometryType,
    authEnabled: biometrics.authEnabled,
  });

  // Force show toggle for debugging
  const forceShowToggle = true;

  const [isEnablingBiometrics, setIsEnablingBiometrics] = useState(false);

  useEffect(() => {
    fetchBiometrics();
  }, [fetchBiometrics]);

  const handleBiometricToggle = async (value: boolean) => {
    if (isEnablingBiometrics) return;

    setIsEnablingBiometrics(true);

    try {
      if (value) {
        // Enable biometrics - get real wallet password and save with Face ID
        try {
          console.log('🔐 Setting up Face ID authentication...');

          console.log('🔐 Getting password via Face ID scan...');

          // Try to get password from keychain first (if Face ID already enabled)
          let walletPassword = null;
          try {
            walletPassword = await apisKeychain.requestGenericPassword();
            console.log('🔐 Got password from keychain:', !!walletPassword);
          } catch {
            console.log(
              '🔐 No existing keychain password, will prompt for Face ID',
            );
          }

          // If no password from keychain, get from keyring (password unlock)
          if (!walletPassword) {
            const { keyringService } = await import('@/core/services/KeyringService');

            if (!keyringService.isUnlocked()) {
              Alert.alert(
                'Error',
                'Please unlock wallet first to enable Face ID',
              );
              setIsEnablingBiometrics(false);
              return;
            }
            walletPassword = keyringService.getPassword();
          }

          if (!walletPassword) {
            Alert.alert('Error', 'Unable to get wallet password');
            setIsEnablingBiometrics(false);
            return;
          }

          console.log('🔐 Saving wallet password with Face ID protection...');

          // Clear existing keychain first, then save with Face ID protection
          try {
            await apisKeychain.resetGenericPassword();
            console.log('🔐 Cleared existing keychain data');
          } catch {
            console.log('🔐 No existing keychain data to clear');
          }

          // Now save password with Face ID protection - this will trigger Face ID prompt
          await apisKeychain.setGenericPassword(
            walletPassword,
            KEYCHAIN_AUTH_TYPES.BIOMETRICS,
          );

          // Refresh biometrics state to reflect the change
          await fetchBiometrics();

          // If we reach here, Face ID was successful
          console.log('✅ Face ID successful - real password saved');
          console.log('✅ Biometrics enabled successfully');
          Alert.alert(
            'Success',
            `${defaultTypeLabel} authentication enabled successfully!`,
          );
        } catch (error) {
          console.error('❌ Error enabling biometrics:', error);
          Alert.alert(
            'Error',
            'Failed to enable biometric authentication. Please try again.',
          );
        } finally {
          setIsEnablingBiometrics(false);
        }
      } else {
        // Disable biometrics
        Alert.alert(
          'Disable Biometric Authentication?',
          `Are you sure you want to disable ${defaultTypeLabel}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsEnablingBiometrics(false),
            },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                try {
                  await toggleBiometrics(false, {});
                  await fetchBiometrics();
                  setIsEnablingBiometrics(false);

                  Alert.alert(
                    'Disabled',
                    `${defaultTypeLabel} has been disabled`,
                  );
                } catch (err) {
                  console.error('Error disabling biometrics:', err);
                  Alert.alert(
                    'Error',
                    'Failed to disable biometric authentication',
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
      Alert.alert('Error', 'Failed to update biometric settings');
      setIsEnablingBiometrics(false);
    }
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change feature coming soon', [
      { text: 'OK', style: 'default' },
    ]);
  };

  const handleBackupWallet = () => {
    navigation.navigate('SeedPhraseBackup');
  };

  const handleResetWallet = () => {
    Alert.alert(
      'Reset Wallet',
      'Are you sure you want to reset your wallet? This action cannot be undone. Make sure you have backed up your seed phrase.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
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
              
              // Navigate to Welcome screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Error resetting wallet:', error);
              Alert.alert('Error', 'Failed to reset wallet');
            }
          },
        },
      ],
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <StatusBar barStyle="light-content" backgroundColor="#161616" />

      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-[rgba(106,114,130,0.1)] px-5 py-4">
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center"
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Icon name="ChevronLeft" size={24} color={Colors.brand.primary} />
        </TouchableOpacity>
        <Text className="text-[20px] font-semibold text-text-primary">
          Settings
        </Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView
        className="flex-1 pb-10"
      >
        {/* Security Section */}
        <SectionHeader title="Security" />
        <View className="gap-3 px-5">
          {(couldSetupBiometrics || forceShowToggle) && (
            <SettingItem
              title={`${defaultTypeLabel} Authentication`}
              subtitle={
                isBiometricsEnabled
                  ? `Unlock wallet with ${defaultTypeLabel}`
                  : `Enable ${defaultTypeLabel} for quick access`
              }
              showArrow={false}
              onPress={() => handleBiometricToggle(!isBiometricsEnabled)}
              rightComponent={
                <View className="min-w-[51px] items-center justify-center pr-2">
                  <Switch
                    value={isBiometricsEnabled}
                    onValueChange={handleBiometricToggle}
                    trackColor={{
                      false: Colors.background.secondary,
                      true: Colors.brand.primary,
                    }}
                    thumbColor={Colors.system.white}
                    disabled={isEnablingBiometrics}
                  />
                </View>
              }
            />
          )}
          <SettingItem
            title="Change Password"
            subtitle="Update your wallet password"
            onPress={handleChangePassword}
          />
        </View>

        {/* Wallet Section */}
        <SectionHeader title="Wallet" />
        <View className="gap-3 px-5">
          <SettingItem
            title="Backup Wallet"
            subtitle="View your seed phrase"
            onPress={handleBackupWallet}
          />
        </View>

        {/* About Section */}
        <SectionHeader title="About" />
        <View className="gap-3 px-5">
          <SettingItem title="Version" subtitle="1.0.0" showArrow={false} />
          <SettingItem
            title="Terms of Service"
            onPress={() => Alert.alert('Terms', 'Terms of Service')}
          />
          <SettingItem
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Privacy Policy')}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" />
        <View className="gap-3 px-5">
          <TouchableOpacity
            className="flex-row items-center justify-between rounded-xl bg-[rgba(255,107,107,0.1)] px-4 py-4"
            onPress={handleResetWallet}
          >
            <Text className="text-[16px] font-semibold text-[#FF6B6B]">
              Reset Wallet
            </Text>
            <Icon name="ChevronRight" size={20} color={Colors.brand.primary} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center gap-2 px-5 pt-10 pb-5">
          <Text className="text-center text-label text-text-secondary">
            Purro Wallet - Your Gateway to Hyperliquid
          </Text>
          <Text className="text-center text-caption text-text-secondary">
            Made with ❤️ for DeFi
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
