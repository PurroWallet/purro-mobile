import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ChevronRight } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NavigationProp } from '@react-navigation/native';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';
import { useBiometrics } from '@/hooks/biometrics';
import { apisLock, apisWallet, apisKeychain } from '@/core/apis';
import { KEYCHAIN_AUTH_TYPES } from '@/core/services/keychain';
import { useAtom } from 'jotai';
import { walletExists } from '@/atoms/app';

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
      danger ? 'bg-[rgba(255,107,107,0.1)]' : 'bg-[#25272C]/60'
    }`}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.8 : 1}
  >
    <View className="flex-1">
      <Text className={`text-lg font-semibold ${danger ? 'text-[#FF6B6B]' : 'text-[#F9F9F9]'}`}>
        {title}
      </Text>
      {subtitle && (
        <Text className="mt-1 text-sm text-[#8D94A3]">{subtitle}</Text>
      )}
    </View>
    {rightComponent ||
      (showArrow && (
        <ChevronRight size={20} color="#FFFFFF" />
      ))}
  </TouchableOpacity>
);

// Section Header Component
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <View className="mt-6 mb-3">
    <Text className="text-sm font-semibold uppercase tracking-[1px] text-[#8D94A3]">
      {title}
    </Text>
  </View>
);

const SettingsScreen: React.FC<Props> = ({ navigation, parentNavigation }) => {
  const [, setWalletExists] = useAtom(walletExists);
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
            console.log('No existing keychain password');
          }

          if (!walletPassword) {
            const { keyringService } = await import('@/core/services/KeyringService');

            if (!keyringService.isUnlocked()) {
              Alert.alert(
                'Error',
                'Please unlock wallet first to enable biometric authentication',
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
            'Success',
            `${defaultTypeLabel} authentication enabled successfully!`,
          );
        } catch (error) {
          console.error('Error enabling biometrics:', error);
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
              
              // Use parent navigation to reset to Welcome screen
              if (parentNavigation) {
                parentNavigation.reset({
                  index: 0,
                  routes: [{ name: 'Welcome' }],
                });
              }
            } catch (error) {
              console.error('Error resetting wallet:', error);
              Alert.alert('Error', 'Failed to reset wallet');
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
        title="Settings"
        onBack={() => navigation.goBack()}
      />
      <View className="mb-4" />

      <ScrollView className="flex-1">
        {/* Security Section */}
        <View className="px-5">
          <SectionHeader title="Security" />
          <View className="gap-2">
            {couldSetupBiometrics && (
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
              title="Change Password"
              subtitle="Update your wallet password"
              onPress={handleChangePassword}
            />
          </View>
        </View>

        {/* Wallet Section */}
        <View className="px-5 mt-6">
          <SectionHeader title="Wallet" />
          <View className="gap-2">
            <SettingItem
              title="Backup Wallet"
              subtitle="View your seed phrase"
              onPress={handleBackupWallet}
            />
          </View>
        </View>

        {/* About Section */}
        <View className="px-5 mt-6">
          <SectionHeader title="About" />
          <View className="gap-2">
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
        </View>

        {/* Danger Zone */}
        <View className="px-5 mt-6 pb-10">
          <SectionHeader title="Danger Zone" />
          <View className="gap-2">
            <SettingItem
              title="Reset Wallet"
              subtitle="This will erase all wallet data"
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