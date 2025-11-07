import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import type { NavigationProp } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import AccountStackNavigator from './AccountStackNavigator';
import CustomBackground from './CustomBackground';

interface Account {
  address: string;
  type: string;
  brandName: string;
  aliasName?: string;
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

const AccountBottomSheet = forwardRef<AccountBottomSheetRef, AccountBottomSheetProps>(
  ({ onClose, currentAccount, onAccountSelect, navigation, onResetWallet }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModalMethods>(null);
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

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
      // Navigation is handled by the nested AccountStackNavigator
      console.log('📝 AccountBottomSheet: Add account requested');
    }, []);

    const handleSettings = useCallback(() => {
      // Navigation is handled by the nested AccountStackNavigator
      console.log('📝 AccountBottomSheet: Settings requested');
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

    const currentAccountName = currentAccount?.aliasName || 'Account 1';
    const currentAccountAddress = currentAccount?.address || '';

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
          backgroundColor: isDarkMode ? '#373B43' : '#ffffff',
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
          navigation={navigation}
          onResetWallet={onResetWallet}
          onAddAccount={handleAddAccount}
          onSettings={handleSettings}
        />
      </BottomSheetModal>
    );
  },
);

export default AccountBottomSheet;
