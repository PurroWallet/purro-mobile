import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type WebViewScreenRouteProp = RouteProp<AccountStackParamList, 'WebView'>;
type WebViewScreenNavigationProp = NativeStackNavigationProp<AccountStackParamList, 'WebView'>;

interface WebViewScreenProps {
  route: WebViewScreenRouteProp;
  navigation: WebViewScreenNavigationProp;
}

const WebViewScreen: React.FC<WebViewScreenProps> = ({ route, navigation }) => {
  const { url, title } = route.params;
  const [isLoading, setIsLoading] = useState(true);

  return (
    <BaseScreen
      title={title || 'Web View'}
      showBackButton={true}
      onBack={() => navigation.goBack()}
      isScrollable={false}
    >
      <View className="flex-1">
        <WebView
          source={{ uri: url }}
          style={{ flex: 1, backgroundColor: '#161616' }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
        {isLoading && (
          <View className="absolute inset-0 items-center justify-center bg-primary">
            <ActivityIndicator size="large" className="text-brand-primary" />
          </View>
        )}
      </View>
    </BaseScreen>
  );
};

export default WebViewScreen;
