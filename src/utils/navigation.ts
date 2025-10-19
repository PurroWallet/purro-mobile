export function getReadyNavigationInstance() {
  return {
    navigate: (screen: string, params?: any) => {
      console.log('Navigate to:', screen, params);
    },
    goBack: () => {
      console.log('Go back');
    },
  };
}
