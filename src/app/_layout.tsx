import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@/design/theme/ThemeContext';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDb } from '@/database/db';
import { logger } from '@/core/logging/Logger';
import { useAIModelStore } from '@/ai/AIModelManager';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isDbReady, setIsDbReady] = useState(false);
  const { checkStatus } = useAIModelStore();
  const [loaded, error] = useFonts({
    // Add custom fonts if needed
  });

  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all([
          initDb(),
          checkStatus()
        ]);
        setIsDbReady(true);
      } catch (e) {
        logger.error('Failed to initialize app', e);
        setIsDbReady(true);
      }
    }
    prepare();
  }, [checkStatus]);

  useEffect(() => {
    if ((loaded || error) && isDbReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isDbReady]);

  if ((!loaded && !error) || !isDbReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
