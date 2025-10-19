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
import { apisLock } from '@/core/apis';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';

type Props = NativeStackScreenProps<AccountStackParamList, 'PasswordVerification'> & {
  onClose: () => void;
};

interface RouteParams {
  accountAddress: string;
  onSuccess: () => void;
}

const PasswordVerificationScreen: React.FC<Props> = ({ 
  navigation, 
  onClose,
  route 
}) => {
  const { accountAddress, onSuccess } = (route.params || {}) as RouteParams;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      
      // Verify password
      const result = await apisLock.verifyPassword(password);
      
      if (result.success) {
        // Password is correct, call onSuccess callback
        onSuccess();
      } else {
        Alert.alert('Error', 'Incorrect password');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      Alert.alert('Error', 'Failed to verify password');
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
          title="Verify Password"
          onBack={() => navigation.goBack()}
        />
        <View className="mb-4" />

        <View className="flex-1 px-5 justify-between">
          <View className="flex-1">
            <Text className="text-lg text-[#F9F9F9] mb-2">
              Enter Password
            </Text>
            <Text className="mb-6 text-sm text-text-secondary">
              Enter your password to view your private key
            </Text>

            <View className="mb-5">
              <Text className="mb-2 text-sm text-text-primary">
                Password
              </Text>
              <View className="flex-row items-center rounded-xl border border-border-primary px-4 py-4">
                <TextInput
                  className="flex-1 text-lg text-text-primary"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="rgb(var(--color-text-secondary))"
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
                    <EyeOff size={20} color="rgb(var(--color-text-secondary))" />
                  ) : (
                    <Eye size={20} color="rgb(var(--color-text-secondary))" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="px-5 pb-6">
            <TouchableOpacity
              className={`w-full min-h-12 items-center justify-center rounded-xl px-6 py-4 ${
                !password || isLoading ? 'bg-background-secondary' : 'bg-brand-primary'
              }`}
              onPress={handleVerify}
              disabled={!password || isLoading}
            >
              <Text
                className={`text-base font-medium ${
                  !password || isLoading ? 'text-text-secondary' : 'text-button-primary-text'
                }`}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomSheetView>
  );
};

export default PasswordVerificationScreen;