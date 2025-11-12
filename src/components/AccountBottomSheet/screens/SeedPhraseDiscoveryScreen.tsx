import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Animated, Dimensions, Text, View } from 'react-native';
import { walletService } from '@/core/services';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type Props = {
  mnemonic: string;
  password: string;
  onSuccess?: (account: any) => void;
};

const { width } = Dimensions.get('window');

const SeedPhraseDiscoveryScreen: React.FC<Props> = ({ mnemonic, password, onSuccess }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'SeedPhraseDiscovery'>>();
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [discoveryStep, setDiscoveryStep] = useState(0);
  const [isDiscovering, setIsDiscovering] = useState(true);
  const [discoveredAccounts, setDiscoveredAccounts] = useState<string[]>([]);

  const discoverySteps = [
    'Initializing keyring...',
    'Deriving addresses...',
    'Scanning for accounts...',
    'Validating balances...',
    'Finalizing setup...',
  ];

  useEffect(() => {
    startDiscovery();
  }, []);

  const startDiscovery = async () => {
    setIsDiscovering(true);

    // Animate through discovery steps
    for (let i = 0; i < discoverySteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      Animated.timing(progress, {
        toValue: (i + 1) / discoverySteps.length,
        duration: 600,
        useNativeDriver: false,
      }).start();
      setDiscoveryStep(i);
    }

    try {
      console.log('🔍 Starting account discovery with mnemonic');

      // Import the wallet using the mnemonic
      const addresses = await walletService.importWalletWithMnemonic(mnemonic, password);
      console.log('✅ Discovered accounts:', addresses);

      setDiscoveredAccounts(addresses);

      // Success animation
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (onSuccess && addresses.length > 0) {
        const newAccount = {
          address: addresses[0],
          aliasName: 'Imported Wallet',
          brandName: 'Mnemonic',
        };
        onSuccess(newAccount);
      }

      // Navigate to success screen or go back
      navigation.navigate('Success', {
        title: 'Wallet Imported Successfully',
        message: `Discovered ${addresses.length} account${addresses.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('❌ Discovery failed:', error);
      // Navigate back with error
      navigation.goBack();
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <BaseScreen title="Discovering Accounts">
      <View className="flex-1 items-center justify-center gap-8 px-6">
        {/* Animated Icon */}
        <View className="relative">
          <View className="w-20 h-20 rounded-full bg-brand-primary opacity-20 animate-pulse" />
          <View className="absolute inset-0 w-20 h-20 rounded-full bg-brand-primary opacity-40 animate-ping" />
          <View className="absolute inset-2 w-16 h-16 rounded-full bg-brand-primary items-center justify-center">
            <Text className="text-2xl font-bold text-white">🔍</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="w-full">
          <View className="w-full h-2 bg-background-secondary rounded-full overflow-hidden">
            <Animated.View
              className="h-full bg-brand-primary rounded-full"
              style={{
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>
        </View>

        {/* Discovery Status */}
        <View className="items-center gap-4">
          <Text className="text-h5 text-text-primary text-center">
            {discoverySteps[discoveryStep]}
          </Text>

          <Text className="text-button text-text-secondary text-center">
            {isDiscovering
              ? 'Please wait while we discover your accounts'
              : discoveredAccounts.length > 0
                ? `Found ${discoveredAccounts.length} account${discoveredAccounts.length > 1 ? 's' : ''}`
                : 'Discovery complete'}
          </Text>
        </View>

        {/* Discovered Accounts Preview */}
        {discoveredAccounts.length > 0 && (
          <View className="w-full gap-3">
            <Text className="text-h6 text-text-primary">Discovered Accounts:</Text>
            {discoveredAccounts.slice(0, 3).map((address, index) => (
              <View key={address} className="bg-background-secondary rounded-lg p-3">
                <Text className="text-sm text-text-primary">Account {index + 1}</Text>
                <Text className="text-xs text-text-secondary">
                  {address.slice(0, 10)}...{address.slice(-8)}
                </Text>
              </View>
            ))}
            {discoveredAccounts.length > 3 && (
              <Text className="text-xs text-text-tertiary text-center">
                +{discoveredAccounts.length - 3} more accounts
              </Text>
            )}
          </View>
        )}

        {/* Loading Dots */}
        {isDiscovering && (
          <View className="flex-row gap-2">
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                className="w-2 h-2 bg-brand-primary rounded-full"
                style={{
                  opacity: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                  transform: [
                    {
                      scale: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                  ],
                }}
              />
            ))}
          </View>
        )}
      </View>
    </BaseScreen>
  );
};

export default SeedPhraseDiscoveryScreen;
