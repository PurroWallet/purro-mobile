import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { walletController } from '@/core/controllers/WalletController';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';
import { PasswordInputForm } from '@/components';
import z from 'zod';

type Props = NativeStackScreenProps<AccountStackParamList, 'CreatePassword'> & {
  onClose: () => void;
  parentNavigation: any;
};

interface RouteParams {
  mnemonic: string;
  isPrivateKeyImport?: boolean;
  isNewAccount?: boolean;
}

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const CreatePasswordScreen: React.FC<Props> = ({ 
  navigation, 
  onClose, 
  parentNavigation,
  route 
}) => {
  const { mnemonic, isPrivateKeyImport, isNewAccount } = (route.params || {}) as RouteParams;
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setIsLoading(true);

      let addresses: string[] = [];

      if (isNewAccount) {
        // Create new account
        const result = await walletController.createWallet(data.password);
        addresses = result.addresses;
      } else if (mnemonic) {
        // Import existing wallet
        if (isPrivateKeyImport) {
          // Handle private key import
          addresses = await walletController.importWalletWithPrivateKey(mnemonic);
        } else {
          // Handle mnemonic import
          addresses = await walletController.importWalletWithMnemonic(mnemonic, data.password);
        }
      }

      // Navigate to success screen
      navigation.navigate('Success', {
        title: isNewAccount ? 'Account Created' : 'Wallet Imported',
        message: isNewAccount
          ? 'Your new account has been created successfully.'
          : 'Your wallet has been imported successfully.',
      });
    } catch (error) {
      console.error('Failed to create wallet:', error);
      Alert.alert('Error', 'Failed to import wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheetView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <SheetHeader 
          title="Create Password"
          onBack={() => navigation.goBack()}
        />
        <View className="mb-4" />

        <View className="flex-1 px-5 justify-between">
          <View className="flex-1">
            <Text className="mb-2 text-lg text-text-primary">
              Create Password
            </Text>
            <Text className="mb-6 text-sm text-text-secondary">
              Set a password to secure your wallet
            </Text>

            <PasswordInputForm
              name="password"
              label="Password"
              placeholder="Enter your password"
            />

            <PasswordInputForm
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
            />

            <Text className="mt-2 text-sm leading-5 text-text-secondary">
              Password must be at least 8 characters long and contain uppercase, lowercase, and numbers
            </Text>
          </View>

          <View className="px-5 pb-6">
            <TouchableOpacity
              className={`w-full min-h-12 items-center justify-center rounded-xl px-6 py-4 ${
                (!isValid || isLoading)
                  ? 'bg-background-secondary'
                  : 'bg-brand-primary'
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading}
            >
              <Text
                className={`text-base font-medium ${
                  (!isValid || isLoading)
                    ? 'text-text-secondary'
                    : 'text-button-primary-text'
                }`}
              >
                {isLoading ? 'Importing...' : 'Import Wallet'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomSheetView>
  );
};

export default CreatePasswordScreen;