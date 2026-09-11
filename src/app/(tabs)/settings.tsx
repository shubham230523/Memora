import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/design/theme/ThemeContext';

export default function SettingsScreen() {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={{ color: theme.colors.text }}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
