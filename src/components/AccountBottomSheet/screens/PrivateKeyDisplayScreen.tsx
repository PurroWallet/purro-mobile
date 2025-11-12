import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Clipboard, ScrollView, Share, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type Props = {
  privateKey: string;
  accountAddress: string;
};

const PrivateKeyDisplayScreen: React.FC<Props> = ({ privateKey, accountAddress }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'PrivateKeyDisplay'>>();

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setString(privateKey);
      Alert.alert('Success', 'Private key copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy private key');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: privateKey,
        title: 'Private Key',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share private key');
    }
  };

  const formatPrivateKey = (key: string) => {
    // Insert line breaks every 20 characters for better readability
    return key.match(/.{1,20}/g)?.join('\n') || key;
  };

  return (
    <BaseScreen title="Private Key">
      <ScrollView className="flex-1">
        <View className="gap-6">
          <View className="items-center gap-4">
            <Icon name="key" size={64} color="#FF6B6B" />
            <View className="items-center gap-2">
              <Text className="text-h4 text-text-primary">Your Private Key</Text>
              <Text className="text-button text-text-secondary">
                Account: {accountAddress.slice(0, 10)}...{accountAddress.slice(-8)}
              </Text>
            </View>
          </View>

          <View className="gap-4">
            <View className="rounded-lg bg-background-secondary p-4">
              <Text className="text-xs text-text-tertiary mb-2">⚠️ WARNING ⚠️</Text>
              <Text className="text-sm text-text-secondary leading-5">
                Anyone with access to this private key can control your wallet and steal all funds.
                Never share this with anyone or store it in an insecure location.
              </Text>
            </View>

            <View className="rounded-lg bg-background-primary border border-border p-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text className="font-mono text-sm text-text-primary">
                  {formatPrivateKey(privateKey)}
                </Text>
              </ScrollView>
            </View>

            <View className="flex-row gap-3">
              <Button
                type="secondary"
                title="Copy"
                onPress={handleCopyToClipboard}
                className="flex-1"
              />
              <Button type="secondary" title="Share" onPress={handleShare} className="flex-1" />
            </View>
          </View>

          <View className="gap-4 pt-4">
            <Text className="text-h5 text-text-primary">Security Tips:</Text>
            <View className="gap-2">
              <Text className="text-sm text-text-secondary">
                • Store this key in a secure offline location
              </Text>
              <Text className="text-sm text-text-secondary">
                • Consider using a hardware wallet for long-term storage
              </Text>
              <Text className="text-sm text-text-secondary">
                • Never enter this key on suspicious websites
              </Text>
              <Text className="text-sm text-text-secondary">
                • Keep backups in multiple secure locations
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </BaseScreen>
  );
};

export default PrivateKeyDisplayScreen;
