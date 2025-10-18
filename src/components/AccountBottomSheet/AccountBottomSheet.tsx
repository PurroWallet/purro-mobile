import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import type { NavigationProp } from '@react-navigation/native';
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useBottomSheetAnimationConfigs } from '@/hooks/useBottomSheetAnimationConfigs';
import AccountStackNavigator from './AccountStackNavigator';
import CustomBackground from './CustomBackground';

interface Account {
  address: string;
  type: string;
  brandName: string;
  alianName?: string;
}

interface AccountBottomSheetProps {
  onClose: () => void;
  currentAccount: Account | null;
  onAccountSelect: (account: Account) => void;
  navigation: NavigationProp<any>;
  onResetWallet?: () => void;
}

export interface AccountBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const AccountBottomSheet = forwardRef<
  AccountBottomSheetRef,
  AccountBottomSheetProps
>(({ onClose, currentAccount, onAccountSelect, navigation, onResetWallet }, ref) => {
  const bottomSheetRef = useRef<BottomSheetModalMethods>(null);

  // Snap points for the bottom sheet - using fixed height for navigator
  const snapPoints = useMemo(() => ['90%'], []);

  // Custom animation configs
  const animationConfigs = useBottomSheetAnimationConfigs();

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

  // Custom handle

  // Custom background
  const renderBackground = useCallback(
    (props: any) => <CustomBackground {...props} />,
    [],
  );

  // Expose present/dismiss methods
  useImperativeHandle(ref, () => ({
    present: () => {
      bottomSheetRef.current?.present();
    },
    dismiss: () => {
      bottomSheetRef.current?.dismiss();
    },
  }));

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
      style={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        paddingTop: 10,
      }}
      backgroundComponent={renderBackground}
      handleComponent={null}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
    >
      <AccountStackNavigator
        onClose={onClose}
        currentAccount={currentAccount}
        onAccountSelect={onAccountSelect}
        navigation={navigation}
        onResetWallet={onResetWallet}
      />
    </BottomSheetModal>
  );
});

export default AccountBottomSheet;
