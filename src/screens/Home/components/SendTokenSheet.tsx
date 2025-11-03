import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomBackground from '@/components/AccountBottomSheet/CustomBackground';
import { Button } from '@/components/Button';
import { useTranslation } from '@/utils/i18n';

type Destination = 'Hyperliquid DEX' | 'HyperVM';

type Step = 'destination' | 'token' | 'recipient' | 'amount' | 'confirm';

type TokenAsset = {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  usdRate: number;
};

interface SentTokenSheetProps {
  onClose: () => void;
}

export interface SentTokenSheetRef {
  present: () => void;
  dismiss: () => void;
}

const SentTokenSheet = forwardRef<SentTokenSheetRef, SentTokenSheetProps>(({ onClose }, ref) => {
  const bottomSheetRef = useRef<BottomSheetModalMethods>(null);
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('destination');
  const [destination, setDestination] = useState<Destination | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenAsset | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const tokens = useMemo<TokenAsset[]>(
    () => [
      {
        id: 'usdc',
        name: 'USD Coin',
        symbol: 'USDC',
        balance: 798.2,
        usdRate: 1,
      },
      {
        id: 'sui',
        name: 'Sui',
        symbol: 'SUI',
        balance: 2,
        usdRate: 1.1,
      },
    ],
    [],
  );

  const numericAmount = useMemo(() => {
    const parsed = Number(amount);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount]);

  const usdValue = useMemo(() => {
    if (!selectedToken) {
      return 0;
    }
    return numericAmount * selectedToken.usdRate;
  }, [numericAmount, selectedToken]);

  const exceedsBalance = selectedToken ? numericAmount > selectedToken.balance : false;

  const snapPoints = useMemo(() => ['90%'], []);

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

  const renderBackground = useCallback((props: any) => <CustomBackground {...props} />, []);

  const resetState = useCallback(() => {
    setStep('destination');
    setDestination(null);
    setSelectedToken(null);
    setRecipient('');
    setAmount('');
  }, []);

  const handleDismiss = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    onClose();
    resetState();
  }, [onClose, resetState]);

  useImperativeHandle(ref, () => ({
    present: () => {
      resetState();
      bottomSheetRef.current?.present();
    },
    dismiss: () => {
      handleDismiss();
    },
  }));

  const handleDestinationSelect = useCallback((value: Destination) => {
    setDestination(value);
    setStep('token');
  }, []);

  const handleTokenSelect = useCallback((token: TokenAsset) => {
    setSelectedToken(token);
    setStep('recipient');
  }, []);

  const handleRecipientContinue = useCallback(() => {
    setRecipient((prev) => prev.trim());
    setStep('amount');
  }, []);

  const handleAmountContinue = useCallback(() => {
    setStep('confirm');
  }, []);

  const handleBack = useCallback(() => {
    setStep((current) => {
      switch (current) {
        case 'token':
          setDestination(null);
          return 'destination';
        case 'recipient':
          setRecipient('');
          return 'token';
        case 'amount':
          setAmount('');
          return 'recipient';
        case 'confirm':
          return 'amount';
        default:
          return current;
      }
    });
  }, []);

  const handleSend = useCallback(() => {
    Alert.alert(t('sendToken.sentTitle'), t('sendToken.sentDescription'), [
      {
        text: t('common.ok'),
        onPress: handleDismiss,
      },
    ]);
  }, [handleDismiss, t]);

  const renderTitle = useMemo(() => {
    if (step === 'destination') {
      return t('sendToken.sheetTitle');
    }
    if (step === 'token') {
      return t('sendToken.selectTokenTitle');
    }
    if (step === 'recipient') {
      return selectedToken ? t('sendToken.sendTitle', { symbol: selectedToken.symbol }) : '';
    }
    if (step === 'amount') {
      return t('sendToken.enterAmountTitle');
    }
    return t('sendToken.confirmTitle');
  }, [selectedToken, step, t]);

  const canContinueRecipient = recipient.trim().length > 0;
  const canContinueAmount = selectedToken && numericAmount > 0 && !exceedsBalance;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      animationConfigs={animationConfigs}
      stackBehavior="push"
      enableDynamicSizing={false}
      backgroundComponent={renderBackground}
      handleComponent={null}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      onChange={(index: number) => {
        if (index === -1) {
          onClose();
          resetState();
        }
      }}
    >
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center justify-between">
          {step === 'destination' ? (
            <View className="w-8" />
          ) : (
            <TouchableOpacity onPress={handleBack} className="w-8">
              <Text className="text-2xl text-text-primary">‹</Text>
            </TouchableOpacity>
          )}
          <Text className="text-lg font-semibold text-text-primary">{renderTitle}</Text>
          <TouchableOpacity onPress={handleDismiss} className="w-8 items-end">
            <Text className="text-2xl text-text-primary">✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {step === 'destination' && (
        <View className="flex-1 px-6 pb-8">
          <Text className="text-center text-sm text-text-secondary">
            {t('sendToken.sheetSubtitle')}
          </Text>
          <View className="mt-6 gap-4">
            <TouchableOpacity
              className="rounded-2xl bg-background-secondary px-5 py-6"
              activeOpacity={0.7}
              onPress={() => handleDestinationSelect('Hyperliquid DEX')}
            >
              <Text className="text-lg font-medium text-text-primary">
                {t('sendToken.options.hyperliquid')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-2xl bg-background-secondary px-5 py-6"
              activeOpacity={0.7}
              onPress={() => handleDestinationSelect('HyperVM')}
            >
              <Text className="text-lg font-medium text-text-primary">
                {t('sendToken.options.hypervm')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 'token' && (
        <ScrollView className="flex-1 px-6 pb-8" contentContainerStyle={{ paddingBottom: 24 }}>
          <Text className="text-sm text-text-secondary">
            {t('sendToken.destinationLabel', { destination })}
          </Text>
          <View className="mt-6">
            {tokens.length === 0 ? (
              <Text className="text-center text-sm text-text-secondary">
                {t('sendToken.emptyTokens')}
              </Text>
            ) : (
              tokens.map((token) => (
                <TouchableOpacity
                  key={token.id}
                  onPress={() => handleTokenSelect(token)}
                  activeOpacity={0.7}
                  className="mb-3 flex-row items-center justify-between rounded-2xl bg-background-secondary px-5 py-5"
                >
                  <View>
                    <Text className="text-base font-semibold text-text-primary">
                      {token.symbol}
                    </Text>
                    <Text className="text-sm text-text-secondary">{token.name}</Text>
                  </View>
                  <Text className="text-base font-medium text-text-primary">
                    {token.balance.toFixed(2)} {token.symbol}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {step === 'recipient' && selectedToken && (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="flex-1 px-6 pb-8">
            <Text className="text-sm text-text-secondary">
              {t('sendToken.availableLabel', {
                amount: selectedToken.balance.toFixed(2),
                symbol: selectedToken.symbol,
              })}
            </Text>
            <View className="mt-8 gap-3">
              <Text className="text-base font-medium text-text-primary">
                {t('sendToken.recipientLabel')}
              </Text>
              <TextInput
                value={recipient}
                onChangeText={setRecipient}
                placeholder={t('sendToken.recipientPlaceholder')}
                placeholderTextColor="#6A7282"
                autoCapitalize="none"
                className="h-14 rounded-2xl border border-border-secondary bg-background-secondary px-4 text-base text-text-primary"
              />
            </View>
          </View>
          <View className="px-6 pb-8">
            <Button
              title={t('common.continue')}
              onPress={handleRecipientContinue}
              disabled={!canContinueRecipient}
            />
          </View>
        </KeyboardAvoidingView>
      )}

      {step === 'amount' && selectedToken && (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="flex-1 px-6 pb-8">
            <Text className="text-sm text-text-secondary">
              {t('sendToken.availableLabel', {
                amount: selectedToken.balance.toFixed(2),
                symbol: selectedToken.symbol,
              })}
            </Text>

            <View className="mt-8 rounded-2xl border border-border-secondary bg-background-secondary p-6">
              <View className="flex-row items-center justify-between">
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder={t('sendToken.amountPlaceholder', { symbol: selectedToken.symbol })}
                  placeholderTextColor="#6A7282"
                  keyboardType="decimal-pad"
                  className="flex-1 text-4xl font-semibold text-text-primary"
                />
                <TouchableOpacity
                  onPress={() => setAmount(selectedToken.balance.toString())}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-semibold uppercase text-brand-primary">
                    {t('sendToken.maxButton')}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text className="mt-4 text-sm text-text-secondary">
                {t('sendToken.usdValueLabel', { value: usdValue.toFixed(2) })}
              </Text>
            </View>

            {exceedsBalance ? (
              <Text className="mt-4 text-sm text-system-error">
                {t('sendToken.insufficientBalance')}
              </Text>
            ) : null}
          </View>
          <View className="px-6 pb-8">
            <Button
              title={t('common.continue')}
              onPress={handleAmountContinue}
              disabled={!canContinueAmount}
            />
          </View>
        </KeyboardAvoidingView>
      )}

      {step === 'confirm' && destination && selectedToken && (
        <View className="flex-1 px-6 pb-8">
          <View className="mt-4 rounded-2xl bg-background-secondary p-6">
            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-text-secondary">
                  {t('sendToken.summary.recipient')}
                </Text>
                <Text className="text-sm font-medium text-text-primary">{recipient}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-text-secondary">
                  {t('sendToken.summary.network')}
                </Text>
                <Text className="text-sm font-medium text-text-primary">{destination}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-text-secondary">{t('sendToken.summary.amount')}</Text>
                <Text className="text-sm font-medium text-text-primary">
                  {numericAmount.toFixed(2)} {selectedToken.symbol}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-text-secondary">
                  {t('sendToken.summary.usdValue')}
                </Text>
                <Text className="text-sm font-medium text-text-primary">
                  ${usdValue.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-auto flex-row gap-3 pt-8">
            <View className="flex-1">
              <Button type="secondary" title={t('common.cancel')} onPress={handleDismiss} />
            </View>
            <View className="flex-1">
              <Button title={t('sendToken.sendButton')} onPress={handleSend} />
            </View>
          </View>
        </View>
      )}
    </BottomSheetModal>
  );
});

export default SentTokenSheet;
