import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components';
import { Icon } from '@/components/Icon';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type Props = NativeStackScreenProps<AccountStackParamList, 'Success'> & {
  onClose: () => void;
};

interface RouteParams {
  title: string;
  message: string;
  buttonText?: string;
  newAccountAddress?: string;
  shouldSetAsCurrent?: boolean;
  onAccountCreated?: (account: any) => void;
  onSuccess?: () => void;
}

const SuccessScreen: React.FC<Props> = ({ navigation, onClose, route }) => {
  const {
    title,
    message,
    buttonText = 'Done',
    newAccountAddress,
    shouldSetAsCurrent,
    onAccountCreated,
    onSuccess,
  } = (route.params || {}) as RouteParams;

  const handleDone = () => {
    console.log('✅ SuccessScreen: User clicked done');
    console.log('📍 New account address:', newAccountAddress?.substring(0, 10) + '...');
    console.log('🎯 Should set as current:', shouldSetAsCurrent);

    // Set the new account as current if needed
    if (shouldSetAsCurrent && newAccountAddress && onAccountCreated) {
      console.log('🔄 Setting new account as current wallet...');
      const newAccount = {
        address: newAccountAddress,
        aliasName: 'New Account', // Will be updated with proper name
        brandName: 'MNEMONIC',
      };
      onAccountCreated(newAccount);
    }

    // Call onSuccess callback if provided
    if (onSuccess) {
      console.log('🔄 Calling onSuccess callback...');
      onSuccess();
    }

    // Clear navigation stack and go back to AccountList
    navigation.reset({
      index: 0,
      routes: [{ name: 'AccountList' }],
    });

    // Close the bottom sheet after a short delay
    setTimeout(() => {
      onClose();
    }, 100);
  };

  return (
    <BaseScreen title="" showBackButton={false}>
      <View className="flex-1 items-center justify-center px-5 py-10">
        {/* Success Icon */}
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-brand-primary/20">
          <Icon name="check" size={40} />
        </View>

        {/* Title */}
        <Text className="mb-3 text-center text-2xl font-semibold text-[#F9F9F9]">{title}</Text>

        {/* Message */}
        <Text className="mb-8 text-center text-base text-[#8D94A3]">{message}</Text>

        {/* Done Button */}
        <Button type="primary" title={buttonText} onPress={handleDone} className="w-full" />
      </View>
    </BaseScreen>
  );
};

export default SuccessScreen;
