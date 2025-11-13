import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import Clipboard from '@react-native-clipboard/clipboard';
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
import { Button } from '@/components';
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
    const toast = useToast();
    const { t } = useTranslation();

    // State for bottom sheet flow
    const [currentStep, setCurrentStep] = useState<'selectNetwork' | 'showQR'>('selectNetwork');
    const [selectedNetwork, setSelectedNetwork] = useState<string>('Hyperliquid');

    // Available networks
    const networks = useMemo(
      () => [
        { id: '1', name: 'HyperEVM' },
        { id: '2', name: 'Ethereum' },
        { id: '3', name: 'Base' },
        { id: '4', name: 'Arbitrum' },
      ],
      [],
    ) as Network[];

    const selectedNetworkData = useMemo(
      () => networks.find((network) => network.name === selectedNetwork) || networks[0],
      [networks, selectedNetwork],
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
        setCurrentStep('selectNetwork');
        bottomSheetRef.current?.present();
      },
      dismiss: () => {
        setCurrentStep('selectNetwork');
        bottomSheetRef.current?.dismiss();
      },
    }));

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
            setCurrentStep('selectNetwork');
            onClose();
          }
        }}
        backgroundComponent={renderBackground}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between">
            {currentStep === 'selectNetwork' ? (
              <View className="w-8" />
            ) : (
              <TouchableOpacity onPress={() => setCurrentStep('selectNetwork')} className="w-8">
                <Text className="text-2xl text-text-primary">‹</Text>
              </TouchableOpacity>
            )}
            <Text className="text-lg font-semibold text-text-primary">
              {currentStep === 'selectNetwork'
                ? t('receiveToken.selectNetwork')
                : t('receiveToken.receiveToken')}
            </Text>
            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.dismiss()}
              className="w-8 items-end"
            >
              <Text className="text-2xl text-text-primary">✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 pb-10 items-center gap-5">
          {currentStep === 'selectNetwork' ? (
            <>
              <Text className="text-lg text-center px-6 text-[#6A7282]">
                {t('receiveToken.chooseNetwork')}
              </Text>

              <View className="w-full px-5 gap-2">
                {networks.map((network) => (
                  <TouchableOpacity
                    key={network.id}
                    className="flex-row items-center p-6 rounded-xl w-full bg-background-secondary"
                    onPress={() => setSelectedNetwork(network.name)}
                  >
                    {network?.icon && <Text className="text-2xl">{network?.icon}</Text>}
                    <View className="flex-1 ml-4">
                      <Text className="text-lg font-normal text-text-primary">{network.name}</Text>
                      <Text className="text-sm text-text-secondary">
                        {formatAddress(currentAccountAddress)}
                      </Text>
                    </View>
                    {selectedNetwork === network.name && (
                      <Text className="text-2xl text-brand-primary">✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <View className="w-full px-6">
                <Button
                  type="primary"
                  title={t('common.continue')}
                  onPress={() => setCurrentStep('showQR')}
                />
              </View>
            </>
          ) : (
            <>
              {/* <TouchableOpacity
                className="self-start px-6"
                onPress={() => setCurrentStep('selectNetwork')}
              >
                <Text className="text-sm text-text-secondary">{t('common.back')}</Text>
              </TouchableOpacity> */}

              <View className="items-center justify-center gap-5 px-20 w-full">
                <View className="flex-row items-center gap-2.5">
                  <Text className="text-2xl">{selectedNetworkData?.icon}</Text>
                  <Text className="text-2xl font-medium text-text-primary">
                    {selectedNetworkData?.name}
                  </Text>
                </View>
                <Text className="text-sm text-center text-text-secondary">
                  {currentAccountAddress}
                </Text>
                <View className="mt-5 p-2.5 bg-white rounded-[20px]">
                  <QRCode
                    value={currentAccountAddress}
                    size={200}
                    backgroundColor="#FFFFFF"
                    color="#000000"
                  />
                </View>
                <View className="flex-row justify-center gap-7 mt-5">
                  <TouchableOpacity
                    className="flex-row items-center gap-2.5"
                    onPress={handleSaveQR}
                  >
                    <Text className="text-sm text-text-primary">{t('receiveToken.saveQR')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-row items-center gap-2.5"
                    onPress={handleCopyAddress}
                  >
                    <Text className="text-sm text-text-primary">{t('receiveToken.copy')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </BottomSheetModal>
    );
  },
);

export default ReceiveTokenSheet;
