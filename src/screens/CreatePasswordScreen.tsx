import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { Button, PasswordInputForm } from '@/components';
import { Icon } from '@/components/Icon';
import { walletController } from '@/core/controllers/WalletController';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import type { CreatePasswordScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const createPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type CreatePasswordFormValues = ZodFormValues<typeof createPasswordSchema>;

const CreatePasswordScreen: React.FC<CreatePasswordScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { mnemonic, privateKey, isImport, isWeb3Auth, userInfo } = route.params || {};
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useZodForm(createPasswordSchema, {
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const passwordValue = form.watch('password') ?? '';
  const confirmPasswordValue = form.watch('confirmPassword') ?? '';
  const isValid = form.formState.isValid;

  const handleCreateWallet = async (values: CreatePasswordFormValues) => {
    if (isLoading) return;

    try {
      console.log('🚀 CreatePassword: Starting wallet creation...');
      console.log('📊 Parameters:', {
        isWeb3Auth,
        isImport,
        hasMnemonic: !!mnemonic,
        hasPrivateKey: !!privateKey,
      });

      setIsLoading(true);

      let addresses: string[] = [];

      if (isWeb3Auth && privateKey) {
        console.log('🔐 Web3Auth flow: Importing private key...');
        // For Web3Auth users: Boot for new wallet, then import private key
        console.log('🔑 Step 1: Boot for new wallet...');
        await walletController.bootForNewWallet(values.password);
        console.log('✅ Boot complete. Step 2: Import private key...');
        addresses = await walletController.importWalletWithPrivateKey(privateKey);
        console.log('✅ Private key imported, addresses:', addresses);
      } else if (isImport && mnemonic) {
        console.log('📝 Import mnemonic flow...');
        // Import existing wallet: Boot for new wallet, then import mnemonic
        console.log('🔑 Step 1: Boot for new wallet...');
        await walletController.bootForNewWallet(values.password);
        console.log('✅ Boot complete. Step 2: Import mnemonic...');
        addresses = await walletController.importWalletWithMnemonic(mnemonic, values.password);
        console.log('✅ Mnemonic imported, addresses:', addresses);
      } else if (isImport && privateKey) {
        console.log('🔐 Import private key flow...');
        // Import private key: Boot for new wallet, then import private key
        console.log('🔑 Step 1: Boot for new wallet...');
        await walletController.bootForNewWallet(values.password);
        console.log('✅ Boot complete. Step 2: Import private key...');
        addresses = await walletController.importWalletWithPrivateKey(privateKey);
        console.log('✅ Private key imported, addresses:', addresses);
      } else {
        console.log('🆕 Create new wallet flow...');
        // Create new wallet
        const result = await walletController.createWallet(values.password);
        addresses = result.addresses;
        console.log('✅ New wallet created, addresses:', addresses);
      }

      if (addresses && addresses.length > 0) {
        console.log('🎯 Success! Navigating to WalletSuccess...');
        // Navigate to success screen
        navigation.replace('WalletSuccess', {
          addresses,
          isImport: isImport || isWeb3Auth, // Treat Web3Auth as import
          socialInfo: isWeb3Auth ? userInfo : undefined,
        });
      } else {
        console.error('❌ No addresses returned from wallet creation');
        Alert.alert('Error', 'Failed to create wallet - no addresses generated');
      }
    } catch (error) {
      console.error('❌ CreatePassword error:', error);
      Alert.alert(t('errors.generic.title'), t('errors.wallet.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit(handleCreateWallet)();
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 px-5 justify-between">
          <View className="flex-row items-center justify-between mb-6">
            <View className="p-2" onTouchEnd={() => navigation.goBack()}>
              <Icon name="ChevronLeft" size={24} />
            </View>
            <Text className="text-h4 text-text-primary">
              {isWeb3Auth
                ? `Welcome ${userInfo?.name || ''}!`
                : isImport
                  ? t('welcome.importWallet')
                  : t('welcome.createWallet')}
            </Text>
            <View className="w-10" />
          </View>

          <View className="flex-1">
            <Text className="text-button text-text-secondary mb-8">
              {t('password.create.subtitle')}
            </Text>

            <FormProvider {...form}>
              <View className="mb-5">
                <PasswordInputForm
                  name="password"
                  label={t('password.create.passwordLabel')}
                  placeholder={t('password.create.passwordPlaceholder')}
                  autoComplete="password"
                  textContentType="password"
                />
              </View>

              <View className="mb-5">
                <PasswordInputForm
                  name="confirmPassword"
                  label={t('password.create.confirmLabel')}
                  placeholder={t('password.create.confirmPlaceholder')}
                  autoComplete="password"
                  textContentType="password"
                />
              </View>
            </FormProvider>

            <Text className="text-[14px] leading-[20px] text-text-secondary mt-2">
              {t('password.create.requirement')}
            </Text>
          </View>

          <View className="px-5 pb-5">
            <Button
              type="primary"
              title={isLoading ? t('common.loading') : t('password.create.continue')}
              onPress={handleSubmit}
              disabled={!isValid || isLoading}
              className="w-full"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreatePasswordScreen;
