import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Check } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';

type Props = NativeStackScreenProps<AccountStackParamList, 'Success'> & {
  onClose: () => void;
};

interface RouteParams {
  title: string;
  message: string;
  buttonText?: string;
}

const SuccessScreen: React.FC<Props> = ({ 
  navigation, 
  onClose,
  route 
}) => {
  const { title, message, buttonText = 'Done' } = (route.params || {}) as RouteParams;

  const handleDone = () => {
    // Navigate back to AccountList
    navigation.navigate('AccountList');
  };

  return (
    <BottomSheetView className="flex-1">
      {/* Header */}
      <SheetHeader
        title=""
        onBack={undefined}
        showBackButton={false}
      />
      
      <View className="flex-1 items-center justify-center px-5 py-10">
        {/* Success Icon */}
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-brand-primary/20">
          <Check size={40} />
        </View>

        {/* Title */}
        <Text className="mb-3 text-center text-2xl font-semibold text-[#F9F9F9]">
          {title}
        </Text>

        {/* Message */}
        <Text className="mb-8 text-center text-base text-[#8D94A3]">
          {message}
        </Text>

        {/* Done Button */}
        <TouchableOpacity
          onPress={handleDone}
          className="w-full rounded-xl bg-[#059288] px-6 py-4"
        >
          <Text className="text-center text-base font-medium text-[#F9F9F9]">
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheetView>
  );
};

export default SuccessScreen;