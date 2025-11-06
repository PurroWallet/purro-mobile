import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ArrowLeftRight, Compass, Home as HomeIcon, Image as ImageIcon } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { useThemeMode } from '@/core/hooks/useTheme';
import { HomeScreen } from '@/screens';
import HistoryScreen from '@/screens/History/HistoryScreen';
import SwapScreen from '@/screens/Swap/SwapScreen';
import type { MainTabParamList } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const Tab = createBottomTabNavigator<MainTabParamList>();

const PlaceholderScreen: React.FC<{ label: string }> = ({ label }) => (
  <View className="flex-1 items-center justify-center bg-primary">
    <Text className="text-text-primary text-lg font-medium">{label}</Text>
  </View>
);

const createPlaceholderScreen = (key: string) => {
  const Screen: React.FC = () => {
    const { t } = useTranslation();
    return <PlaceholderScreen label={t(key)} />;
  };
  return Screen;
};

const NftScreen = createPlaceholderScreen('home.nav.nft');

const MainTabNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';

  const tabBarBackground = isDark ? '#25272C' : '#FFFFFF';
  const tabBarBorder = isDark ? '#3A3C42' : '#E5E7EB';
  const activeTint = 'rgb(5, 146, 136)';
  const inactiveTint = isDark ? 'rgba(249, 249, 249, 0.6)' : 'rgba(75, 85, 99, 0.7)';

  return (
    <Tab.Navigator
      initialRouteName="HomeMain"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBarBackground,
          borderTopColor: tabBarBorder,
          borderTopWidth: 0.5,
          height: 72,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarLabel: ({ color, focused }) => (
          <Text
            style={{
              color,
              fontSize: 12,
              fontWeight: focused ? '600' : '400',
            }}
          >
            {route.name === 'HomeMain'
              ? t('home.nav.home')
              : route.name === 'Swap'
                ? t('home.nav.swap')
                : route.name === 'Nft'
                  ? t('home.nav.nft')
                  : t('home.nav.history')}
          </Text>
        ),
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'HomeMain':
              return <HomeIcon size={size} color={color} />;
            case 'Swap':
              return <ArrowLeftRight size={size} color={color} />;
            case 'Nft':
              return <ImageIcon size={size} color={color} />;
            case 'History':
            default:
              return <Compass size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="HomeMain" component={HomeScreen} />
      <Tab.Screen name="Swap" component={SwapScreen} />
      <Tab.Screen name="Nft" component={NftScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
