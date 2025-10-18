import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Eye, EyeOff } from 'lucide-react-native';
import { walletController } from '@/core/controllers/WalletController';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';

type Props = NativeStackScreenProps<AccountStackParamList, 'CreatePassword'> & {
  onClose: () => void;
  parentNavigation: any;
};

interface RouteParams {
  mnemonic: string;
  isPrivateKeyImport?: boolean;
  isNewAccount?: boolean;
}

const CreatePasswordScreen: React.FC<Props> = ({ 
  navigation, 
  onClose, 
  parentNavigation,
  route 
}) => {
  const { mnemonic, isPrivateKeyImport, isNewAccount } = (route.params || {}) as RouteParams;
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
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);

      let addresses: string[] = [];

      if (isNewAccount) {
        // Create new account
        const result = await walletController.createWallet(password);
        addresses = result.addresses;
      } else if (mnemonic) {
        // Import existing wallet
        if (isPrivateKeyImport) {
          // Handle private key import
          addresses = await walletController.importWalletWithPrivateKey(mnemonic);
        } else {
          // Handle mnemonic import
          addresses = await walletController.importWalletWithMnemonic(mnemonic, password);
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
            <Text className="text-lg text-[#F9F9F9] mb-2">
              Create Password
            </Text>
            <Text className="text-sm text-[#8D94A3] mb-6">
              Set a password to secure your wallet
            </Text>

            <View className="mb-5">
              <Text className="text-sm text-[#F9F9F9] mb-2">
                Password
              </Text>
              <View className="flex-row items-center rounded-xl border border-[#494F5B] px-4 py-4">
                <TextInput
                  className="flex-1 text-lg text-[#F9F9F9]"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#8D94A3"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity
                  className="ml-2"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#8D94A3" />
                  ) : (
                    <Eye size={20} color="#8D94A3" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-sm text-[#F9F9F9] mb-2">
                Confirm Password
              </Text>
              <View className="flex-row items-center rounded-xl border border-[#494F5B] px-4 py-4">
                <TextInput
                  className="flex-1 text-lg text-[#F9F9F9]"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor="#8D94A3"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity
                  className="ml-2"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#8D94A3" />
                  ) : (
                    <Eye size={20} color="#8D94A3" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-sm leading-5 text-[#8D94A3] mt-2">
              Password must be at least 8 characters long
            </Text>
          </View>

          <View className="px-5 pb-6">
            <TouchableOpacity
              className={`w-full min-h-12 items-center justify-center rounded-xl px-6 py-4 ${
                (!password || !confirmPassword || !validatePassword(password) || isLoading)
                  ? 'bg-[#373B43]'
                  : 'bg-[#059288]'
              }`}
              onPress={handleCreateWallet}
              disabled={!password || !confirmPassword || !validatePassword(password) || isLoading}
            >
              <Text
                className={`text-base font-medium ${
                  (!password || !confirmPassword || !validatePassword(password) || isLoading)
                    ? 'text-[#8D94A3]'
                    : 'text-[#F9F9F9]'
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