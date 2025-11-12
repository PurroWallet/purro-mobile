import React from 'react';
import HomeContent from './components/HomeContent';
import { useHomeScreen } from './hooks/useHomeScreen';

const HomeScreen: React.FC = () => {
  const screenProps = useHomeScreen();

  return <HomeContent {...screenProps} />;
};

export default HomeScreen;
