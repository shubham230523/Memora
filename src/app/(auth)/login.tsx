import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from '@/design/components/Button';
import { TextInput } from '@/design/components/TextInput';
import { ThemeProvider, useTheme } from '@/design/theme/ThemeContext';

export default function LoginScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Welcome to Recall</Text>
      <TextInput label="Email" placeholder="email@example.com" />
      <TextInput label="Password" placeholder="••••••••" secureTextEntry />
      <Button
        title="Login"
        onPress={() => {}}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
});
