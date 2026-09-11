import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeProvider } from '@/design/theme/ThemeContext';
import HomeScreenPreview from '@/preview/HomeScreenPreview';

export default function PreviewRoute() {
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <HomeScreenPreview />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
