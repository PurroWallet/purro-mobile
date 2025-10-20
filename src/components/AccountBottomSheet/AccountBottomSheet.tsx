import type { NavigationProp } from '@react-navigation/native';
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import BaseBottomSheet, { type BaseBottomSheetRef } from '@/components/BaseBottomSheet';
import AccountStackNavigator from './AccountStackNavigator';

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

const AccountBottomSheet = forwardRef<AccountBottomSheetRef, AccountBottomSheetProps>(
  ({ onClose, currentAccount, onAccountSelect, navigation, onResetWallet }, ref) => {
    const bottomSheetRef = useRef<BaseBottomSheetRef>(null);

    // Snap points cho bottom sheet - sử dụng giá trị phù hợp
    const snapPoints = useMemo(() => ['85%'], []);

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
      <BaseBottomSheet
        ref={bottomSheetRef}
        onClose={onClose}
        snapPoints={snapPoints}
        enableHandle={true}
        stackBehavior="push"
        keyboardBehavior={Platform.OS === 'ios' ? 'interactive' : undefined}
        keyboardBlurBehavior="restore"
      >
        <AccountStackNavigator
          onClose={onClose}
          currentAccount={currentAccount}
          onAccountSelect={onAccountSelect}
          navigation={navigation}
          onResetWallet={onResetWallet}
        />
      </BaseBottomSheet>
    );
  },
);

export default AccountBottomSheet;
