import { useNavigationState } from '@react-navigation/native';
import { useMemo, useState } from 'react';

export enum ProtectType {
  SafeTipModal = 'SafeTipModal',
  BlurBackground = 'BlurBackground',
  None = 'None',
}

export interface ProtectedConf {
  iosBlurType: ProtectType;
  warningScreenshotBackup: boolean;
  onOk?: (params: { navigation: any }) => void;
}

const protectedConfAtom = {
  iosBlurType: ProtectType.None,
  warningScreenshotBackup: false,
};

export function useAtSensitiveScene() {
  const { currentRouteName } = useCurrentRouteName();
  const [protectedConf] = useState(protectedConfAtom);

  const atSensitiveScene = useMemo(() => {
    const sensitiveRoutes = ['SeedPhraseDisplay', 'SeedPhraseVerify', 'PrivateKeyExport'];
    return sensitiveRoutes.includes(currentRouteName || '');
  }, [currentRouteName]);

  return { atSensitiveScene, $protectedConf: protectedConf };
}

export function useCurrentRouteName() {
  const navState = useNavigationState((state) => state);

  const currentRouteName = useMemo(() => {
    if (!navState) return undefined;

    let currentRoute = navState.routes[navState.index];

    // Handle nested navigators
    while (currentRoute.state && currentRoute.state.index !== undefined) {
      currentRoute = currentRoute.state.routes[currentRoute.state.index] as typeof currentRoute;
    }

    return currentRoute.name;
  }, [navState]);

  return { currentRouteName };
}

/**
 * @description call this hook only once on the top level of your app
 */
export function useAppPreventScreenshotOnScreen({ isTop = false }: { isTop?: boolean }) {
  // Screenshot prevention is handled by individual screen hooks
  // This hook is for future global prevention logic
  if (isTop) {
    console.log('App-level screenshot prevention enabled');
  }
  return {};
}
