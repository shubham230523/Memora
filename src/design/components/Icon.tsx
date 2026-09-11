import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ColorValue } from 'react-native';
import { colors } from '../theme/colors';

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorValue;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = colors.light.text
}) => {
  return <MaterialCommunityIcons name={name} size={size} color={color as any} />;
};
