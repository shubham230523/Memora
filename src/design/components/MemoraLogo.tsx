import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Icon } from './Icon';
import { useTheme } from '../theme/ThemeContext';

interface MemoraLogoProps {
  size?: number;
  showText?: boolean;
}

export const MemoraLogo: React.FC<MemoraLogoProps> = ({ size = 40, showText = true }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[
        styles.iconBg,
        {
          width: size,
          height: size,
          borderRadius: size * 0.25,
          backgroundColor: theme.colors.primary
        }
      ]}>
        <Icon name="brain" size={size * 0.6} color="#FFF" />
        <View style={[
          styles.glow,
          {
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: size * 0.2,
            backgroundColor: '#FFF',
            opacity: 0.3
          }
        ]} />
      </View>
      {showText && (
        <Text style={[
          styles.text,
          {
            color: theme.colors.text,
            fontSize: size * 0.5,
            marginLeft: size * 0.3
          }
        ]}>
          Memora
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBg: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  glow: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  text: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
});
