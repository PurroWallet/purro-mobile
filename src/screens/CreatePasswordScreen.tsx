import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { walletController } from '@/core/controllers/WalletController';
import type { CreatePasswordScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const CreatePasswordScreen: React.FC<CreatePasswordScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { mnemonic, isImport } = route.params || {};
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pwd: string): boolean => {
    // Basic password validation
    return pwd.length >= 8;
  };

  const handleCreateWallet = async () => {
    if (!validatePassword(password)) {
      Alert.alert(t('errors.generic.title'), t('password.create.validation.tooShort'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('errors.generic.title'), t('password.create.validation.mismatch'));
      return;
    }

    try {
      setIsLoading(true);

      let addresses: string[] = [];

      if (isImport && mnemonic) {
        // Import existing wallet
        addresses = await walletController.importWalletWithMnemonic(mnemonic, password);
      } else {
        // Create new wallet
        const result = await walletController.createWallet(password);
        addresses = result.addresses;
      }

      // Navigate to success screen
      navigation.replace('WalletSuccess', {
        addresses,
        isImport,
      });
    } catch (error) {
      console.error('Failed to create wallet:', error);
      Alert.alert(t('errors.generic.title'), t('errors.wallet.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 px-5 justify-between">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
              <Icon name="ChevronLeft" size={24} />
            </TouchableOpacity>
            <Text className="text-h4 text-text-primary">
              {isImport ? t('welcome.importWallet') : t('welcome.createWallet')}
            </Text>
            <View className="w-10" />
          </View>

          <View className="flex-1">
            <Text className="text-button text-text-secondary mb-8">
              {t('password.create.subtitle')}
            </Text>

            <View className="mb-5">
              <Text className="text-button text-text-primary mb-2">
                {t('password.create.passwordLabel')}
              </Text>
              <View className="flex-row items-center bg-[rgba(255,255,255,0.05)] rounded-xl border border-[rgba(255,255,255,0.1)]">
                <TextInput
                  className="flex-1 h-12 px-4 text-base text-text-primary"
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('password.create.passwordPlaceholder')}
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity className="p-3" onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? 'EyeOff' : 'Eye'}
                    size={20}
                    color="rgb(var(--color-text-secondary))"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-button text-text-primary mb-2">
                {t('password.create.confirmLabel')}
              </Text>
              <View className="flex-row items-center bg-[rgba(255,255,255,0.05)] rounded-xl border border-[rgba(255,255,255,0.1)]">
                <TextInput
                  className="flex-1 h-12 px-4 text-base text-text-primary"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t('password.create.confirmPlaceholder')}
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity
                  className="p-3"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon
                    name={showConfirmPassword ? 'EyeOff' : 'Eye'}
                    size={20}
                    color="rgb(var(--color-text-secondary))"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-[14px] leading-[20px] text-text-secondary mt-2">
              {t('password.create.requirement')}
            </Text>
          </View>

          <View className="px-5 pb-5">
            <TouchableOpacity
              className={`w-full min-h-12 items-center justify-center rounded-xl px-6 py-4 ${
                !password || !confirmPassword || isLoading
                  ? 'bg-button-primary-disabled'
                  : 'bg-brand-primary'
              }`}
              onPress={handleCreateWallet}
              disabled={!password || !confirmPassword || isLoading}
            >
              <Text
                className={`text-button ${
                  !password || !confirmPassword || isLoading
                    ? 'text-button-primary-disabled-text'
                    : 'text-button-primary-text'
                }`}
              >
                {isLoading ? t('common.loading') : t('password.create.continue')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreatePasswordScreen;
