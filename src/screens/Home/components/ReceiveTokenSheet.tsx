import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import Clipboard from '@react-native-clipboard/clipboard';
import { useColorScheme } from 'nativewind';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useToast } from 'react-native-toast-notifications';
import CustomBackground from '@/components/AccountBottomSheet/CustomBackground';
import { useTranslation } from '@/utils/i18n';

interface Account {
  address: string;
  type: string;
  brandName: string;
  alianName?: string;
}

interface Network {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface ReceiveTokenSheetProps {
  onClose: () => void;
  currentAccount?: Account | null;
  onAccountSelect: (account: Account) => void;
  onResetWallet?: () => void;
}

export interface ReceiveTokenSheetRef {
  present: () => void;
  dismiss: () => void;
}

const ReceiveTokenSheet = forwardRef<ReceiveTokenSheetRef, ReceiveTokenSheetProps>(
  ({ onClose, currentAccount, onAccountSelect, onResetWallet }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModalMethods>(null);
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const toast = useToast();
    const { t } = useTranslation();

    // State for selected network
    const [selectedNetwork, setSelectedNetwork] = useState<string>('Hyperliquid');

    // Available networks
    const networks = useMemo(
      () => [
        { id: '1', name: 'Hyperliquid', icon: '🟢' },
        { id: '2', name: 'Ethereum', icon: '🔷' },
        { id: '3', name: 'Solana', icon: '🟣' },
      ],
      [],
    );

    // Snap points for the bottom sheet - using fixed height for navigator
    const snapPoints = useMemo(() => ['90%'], []);

    // Custom animation configs
    const animationConfigs = useMemo(
      () => ({
        damping: 30,
        overshootClamping: true,
        restDisplacementThreshold: 0.5,
        restSpeedThreshold: 0.5,
        stiffness: 300,
      }),
      [],
    );

    // Custom backdrop
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      [],
    );

    // Custom background
    const renderBackground = useCallback((props: any) => <CustomBackground {...props} />, []);

    // Handle copy address to clipboard
    const handleCopyAddress = useCallback(() => {
      if (currentAccount?.address) {
        Clipboard.setString(currentAccount.address);
        toast.show(t('receiveToken.addressCopied'), {
          type: 'success',
          placement: 'bottom',
          duration: 2000,
        });
      }
    }, [currentAccount?.address, toast, t]);

    // Handle save QR code
    const handleSaveQR = useCallback(() => {
      toast.show(t('receiveToken.qrSaved'), {
        type: 'success',
        placement: 'bottom',
        duration: 2000,
      });
    }, [toast, t]);

    // Expose present/dismiss methods
    useImperativeHandle(ref, () => ({
      present: () => {
        bottomSheetRef.current?.present();
      },
      dismiss: () => {
        bottomSheetRef.current?.dismiss();
      },
    }));

    const currentAccountName = currentAccount?.alianName || 'Account 1';
    const currentAccountAddress = currentAccount?.address || '0xe835...dE81';

    // Format address for display
    const formatAddress = (address: string) => {
      if (address.length > 10) {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
      }
      return address;
    };

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        animationConfigs={animationConfigs}
        stackBehavior="push"
        enableDynamicSizing={false}
        onChange={(index: number) => {
          if (index === -1) {
            onClose();
          }
        }}
        backgroundComponent={renderBackground}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center p-6 bg-[#373B43] absolute top-0 left-0 right-0 z-10">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-xl font-medium text-text-primary dark:text-[#F9F9F9]">
              {t('receiveToken.title')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-2xl text-text-primary dark:text-[#F9F9F9]">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 pt-[100px] pb-10 items-center gap-5">
          {/* Network Selection Title */}
          <Text className="text-lg text-center px-6 text-[#6A7282]">
            {t('receiveToken.chooseNetwork')}
          </Text>

          {/* Network Selection */}
          <View className="w-full px-5 gap-2">
            {networks.map((network) => (
              <TouchableOpacity
                key={network.id}
                className={`flex-row items-center p-6 rounded-xl w-full ${isDarkMode ? 'bg-[rgba(37,39,44,0.6)]' : 'bg-[#F5F5F5]'}`}
                onPress={() => setSelectedNetwork(network.name)}
              >
                <Text className="text-2xl">{network.icon}</Text>
                <View className="flex-1 ml-4">
                  <Text
                    className={`text-lg font-normal ${isDarkMode ? 'text-[#F9F9F9]' : 'text-black'}`}
                  >
                    {network.name}
                  </Text>
                  <Text className="text-sm text-[#8D94A3]">
                    {formatAddress(currentAccountAddress)}
                  </Text>
                </View>
                {selectedNetwork === network.name && (
                  <Text className="text-2xl text-[#97FCE4]">✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* QR Code */}
          <View className="items-center justify-center gap-5 px-20 w-full">
            <View className="flex-row items-center gap-2.5">
              <Text className="text-2xl">{networks[0].icon}</Text>
              <Text
                className={`text-2xl font-medium ${isDarkMode ? 'text-[#F9F9F9]' : 'text-black'}`}
              >
                {selectedNetwork}
              </Text>
            </View>
            <Text className="text-sm text-center text-[#8D94A3]">{currentAccountAddress}</Text>
            <View className="mt-5 p-2.5 bg-white rounded-[20px]">
              <QRCode
                value={currentAccountAddress}
                size={200}
                backgroundColor={isDarkMode ? '#161616' : '#FFFFFF'}
                color={isDarkMode ? '#FFFFFF' : '#000000'}
              />
            </View>
            <View className="flex-row justify-center gap-7 mt-5">
              <TouchableOpacity className="flex-row items-center gap-2.5" onPress={handleSaveQR}>
                <Text className={`text-sm ${isDarkMode ? 'text-[#F9F9F9]' : 'text-black'}`}>
                  {t('receiveToken.saveQR')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center gap-2.5"
                onPress={handleCopyAddress}
              >
                <Text className={`text-sm ${isDarkMode ? 'text-[#F9F9F9]' : 'text-black'}`}>
                  {t('receiveToken.copy')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BottomSheetModal>
    );
  },
);

export default ReceiveTokenSheet;
