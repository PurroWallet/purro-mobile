import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Icon } from '@/components/Icon';
import type { RootStackParamList } from '@/types/navigation';

type WebViewScreenRouteProp = RouteProp<RootStackParamList, 'WebView'>;
type WebViewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WebView'>;

interface WebViewScreenProps {
  route: WebViewScreenRouteProp;
  navigation: WebViewScreenNavigationProp;
}

const WebViewScreen: React.FC<WebViewScreenProps> = ({ route, navigation }) => {
  const { url } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      {/* Header with close button */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-background-secondary">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Icon name="x" size={24} />
        </TouchableOpacity>
      </View>

      {/* WebView */}
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View className="flex-1 items-center justify-center bg-primary">
            <ActivityIndicator size="large" />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#161616',
  },
});

export default WebViewScreen;
