import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './components/Header';
import HistoryList from './components/HistoryList';

const HistoryScreen: React.FC = () => {
  const handleFilterPress = () => {
    // TODO: Implement filter functionality
    console.log('Filter pressed');
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <Header onFilterPress={handleFilterPress} />
      <HistoryList />
    </SafeAreaView>
  );
};

export default HistoryScreen;
