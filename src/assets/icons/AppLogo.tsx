import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  color?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ size = 48, color = '#059288' }) => {
  const resolvedColor = color === 'currentColor' ? '#059288' : color;

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="24" fill={resolvedColor} opacity={0.12} />
      <Path
        d="M17 14h14a7 7 0 0 1 0 14h-7v6h8v4H17v-10h11a3 3 0 1 0 0-6h-8z"
        fill={resolvedColor}
      />
    </Svg>
  );
};

export default AppLogo;
