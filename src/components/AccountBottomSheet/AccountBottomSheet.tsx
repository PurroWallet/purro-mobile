import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { type NavigationProp, useNavigation } from '@react-navigation/native';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import type { RootStackParamList } from '@/types/navigation';
import AccountStackNavigator from './AccountStackNavigator';
import CustomBackground from './CustomBackground';

interface Account {
  address: string;
  type?: string;
  brandName?: string;
  aliasName?: string;
}

interface AccountBottomSheetProps {
  onClose: () => void;
  currentAccount?: Account | null;
  onAccountSelect: (account: Account) => void;
  onResetWallet?: () => void;
}

export interface AccountBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const AccountBottomSheet = forwardRef<AccountBottomSheetRef, AccountBottomSheetProps>(
  ({ onClose, currentAccount, onAccountSelect, onResetWallet }, ref) => {
    const navigation = useNavigation<NavigationProp<any>>();
    const bottomSheetRef = useRef<BottomSheetModalMethods>(null);

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

    const handleAddAccount = useCallback(() => {
      // This will be handled by the nested navigator's internal navigation
      // The error indicates we need to call a handler or navigate within the correct context
      console.log('AddAccount requested - this should be handled by nested navigator');
    }, []);

    const handleSettings = useCallback(() => {
      // Nested account stack handles navigation to Settings
    }, []);

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
          parentNavigation={navigation as NavigationProp<RootStackParamList>}
          onAddAccount={handleAddAccount}
          onSettings={handleSettings}
        />
      </BottomSheetModal>
    );
  },
);

export default AccountBottomSheet;
