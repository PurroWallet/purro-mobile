import React from 'react';
import { Image as RNImage, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DefaultIcon from '@/assets/common/icon.png';
import AccountBottomSheet from '@/components/AccountBottomSheet';
import { Icon } from '@/components/Icon';
import type { UseHomeScreenResult } from '../hooks/useHomeScreen';
import ReceiveTokenSheet from './ReceiveTokenSheet';
import SentTokenSheet from './SendTokenSheet';

type HomeContentProps = UseHomeScreenResult;

const HomeContent: React.FC<HomeContentProps> = ({
  t,
  accountBottomSheetRef,
  sentTokenSheetRef,
  receiveTokenSheetRef,
  selectedTab,
  onSelectTab,
  currentAccount,
  perpPositions,
  tokens,
  handleAccountSelect,
  handleResetWallet,
  openAccountSheet,
  openSendSheet,
  openReceiveSheet,
}) => {
  const currentAccountDisplay = currentAccount?.address
    ? `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`
    : '@kycdict';

  const tabLabelMap: Record<'EVM' | 'Spot' | 'Perpetuals', string> = {
    EVM: t('home.tabs.evm'),
    Spot: t('home.tabs.spot'),
    Perpetuals: t('home.tabs.perpetuals'),
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="px-6 pt-5 pb-2">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity className="flex-row items-center gap-4" onPress={openAccountSheet}>
            <RNImage
              source={DefaultIcon}
              className="w-10 h-10 rounded-full border border-border-primary"
              resizeMode="cover"
            />
            <View>
              <Text className="text-text-secondary text-sm">{currentAccountDisplay}</Text>
              <Text className="text-text-primary text-2xl font-medium">
                {currentAccount?.alianName || 'Account 1'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <Icon name="search" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center pt-10 pb-0">
          <Text className="text-text-primary text-5xl font-semibold">
            {t('home.balanceValue', { value: '$254.48' })}
          </Text>
        </View>

        <View className="flex-row gap-2 px-6 py-5">
          <TouchableOpacity
            className="flex-1 items-center gap-3 rounded-xl bg-background-secondary py-4"
            onPress={openSendSheet}
          >
            <Icon name="send" size={24} />
            <Text className="text-text-primary text-sm">{t('home.send')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 rounded-xl bg-background-secondary py-4 items-center gap-3"
            onPress={openReceiveSheet}
          >
            <Icon name="arrow-down-to-line" size={24} />
            <Text className="text-text-primary text-sm">{t('home.receive')}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 rounded-xl bg-background-secondary py-4 items-center gap-3">
            <Icon name="repeat" size={24} />
            <Text className="text-text-primary text-sm">{t('home.swap')}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 rounded-xl bg-background-secondary py-4 items-center gap-3">
            <Icon name="git-branch" size={24} />
            <Text className="text-text-primary text-sm">{t('home.bridge')}</Text>
          </TouchableOpacity>
        </View>

        <View className="pb-0 px-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <View className="rounded-xl bg-background-secondary/60 px-4 py-4 flex-row items-center gap-3.5 min-w-[320px]">
              <RNImage
                source={DefaultIcon}
                className="w-10 h-10 rounded-full border-2 border-background-primary"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-text-primary text-lg">{t('home.createAccount')}</Text>
                <Text className="text-text-secondary text-sm">
                  {t('home.createAccountDescription')}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} />
            </View>

            <View className="rounded-xl bg-background-secondary/60 px-4 py-4 flex-row items-center gap-3.5 min-w-[320px]">
              <RNImage
                source={DefaultIcon}
                className="w-10 h-10 rounded-full border-2 border-background-primary"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-text-primary text-lg">{t('home.createAccount')}</Text>
                <Text className="text-text-secondary text-sm">
                  {t('home.createAccountDescription')}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} />
            </View>
          </ScrollView>
        </View>

        <View className="px-5 pt-10 pb-10">
          <View className="flex-row justify-between items-center px-0 pb-4">
            <Text className="text-text-primary text-lg font-semibold">{t('home.perps')}</Text>
            <TouchableOpacity>
              <Text className="text-brand-primary text-sm font-medium">{t('home.viewMore')}</Text>
            </TouchableOpacity>
          </View>

          {perpPositions.map((position) => (
            <View
              key={position.id}
              className="rounded-xl bg-background-secondary px-4 py-1 flex-row items-center gap-5 mb-2"
            >
              <RNImage source={DefaultIcon} className="w-12 h-12 rounded-full" resizeMode="cover" />
              <View className="flex-1 flex-row justify-between items-center py-5">
                <View className="gap-3">
                  <Text className="text-text-primary text-xl font-medium">{position.name}</Text>
                  <Text className="text-text-secondary text-sm">{position.multiplier}</Text>
                </View>
                <View className="items-end gap-3">
                  <Text className="text-text-primary text-xl font-medium text-right">
                    {position.value}
                  </Text>
                  <Text className="text-system-error text-sm">{position.change}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="px-5 pb-10">
          <View className="flex-row items-center justify-between border-b border-border-secondary pb-0 mb-4">
            <View className="flex-row">
              {(['EVM', 'Spot', 'Perpetuals'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  className={`px-2.5 py-2.5 ${selectedTab === tab ? 'border-b-2 border-text-primary' : ''}`}
                  onPress={() => onSelectTab(tab)}
                >
                  <Text
                    className={`text-lg font-semibold ${
                      selectedTab === tab ? 'text-text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {tabLabelMap[tab]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Icon name="chevron-down" size={20} />
          </View>

          <View className="flex-row gap-2 mb-2">
            <View className="flex-1 rounded-xl bg-background-secondary/60 p-5">
              <Text className="text-text-secondary text-base mb-3.5">{t('home.totalBalance')}</Text>
              <Text className="text-text-primary text-2xl font-medium">$345.64</Text>
            </View>
            <View className="flex-1 rounded-xl bg-background-secondary/60 p-5">
              <Text className="text-text-secondary text-base mb-3.5">{t('home.totalTokens')}</Text>
              <Text className="text-text-primary text-2xl font-medium">1</Text>
            </View>
          </View>

          {tokens.map((token) => (
            <View
              key={token.id}
              className="rounded-xl bg-background-secondary px-4 py-5 flex-row items-center gap-5 mb-2"
            >
              <RNImage source={DefaultIcon} className="w-12 h-12 rounded-full" resizeMode="cover" />
              <View className="flex-1 flex-row justify-between items-center py-5">
                <View className="gap-3">
                  <Text className="text-text-primary text-xl font-medium">{token.name}</Text>
                  <View className="flex-row gap-1.5">
                    <Text className="text-text-primary text-sm">{token.balance}</Text>
                    <Text className="text-text-secondary text-sm">{token.symbol}</Text>
                  </View>
                </View>
                <Text className="text-text-primary text-xl font-medium">{token.value}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity className="rounded-xl bg-background-secondary px-4 py-6 flex-row items-center justify-center gap-2">
            <Icon name="plus" size={16} />
            <Text className="text-text-primary text-base text-right">
              {t('home.addTestnetToken')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AccountBottomSheet
        ref={accountBottomSheetRef}
        onClose={() => {}}
        onAccountSelect={handleAccountSelect}
        onResetWallet={handleResetWallet}
      />
      <SentTokenSheet ref={sentTokenSheetRef} onClose={() => {}} />
      <ReceiveTokenSheet
        ref={receiveTokenSheetRef}
        onClose={() => {}}
        onAccountSelect={handleAccountSelect}
        onResetWallet={handleResetWallet}
      />
    </SafeAreaView>
  );
};

export default HomeContent;
