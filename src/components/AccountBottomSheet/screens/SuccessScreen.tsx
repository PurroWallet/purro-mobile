import { BottomSheetView } from '@gorhom/bottom-sheet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type Props = NativeStackScreenProps<AccountStackParamList, 'Success'> & {
  onClose: () => void;
};

interface RouteParams {
  title: string;
  message: string;
  buttonText?: string;
}

const SuccessScreen: React.FC<Props> = ({ navigation, onClose, route }) => {
  const { title, message, buttonText = 'Done' } = (route.params || {}) as RouteParams;

  const handleDone = () => {
    // Clear navigation stack and go back to AccountList
    navigation.reset({
      index: 0,
      routes: [{ name: 'AccountList' }],
    });
  };

  return (
    <BaseScreen title="" showBackButton={false}>
      <View className="flex-1 items-center justify-center px-5 py-10">
        {/* Success Icon */}
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-brand-primary/20">
          <Check size={40} />
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
