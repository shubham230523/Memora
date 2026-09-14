import '@/polyfills';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@/design/theme/ThemeContext';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDb } from '@/database/db';
import { logger } from '@/core/logging/Logger';
import { useAIModelStore } from '@/ai/AIModelManager';
import { Platform } from '@/platform/Platform';
import { knowledgePipeline } from '@/features/knowledge/KnowledgePipeline';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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

        // HANDLE PENDING CAMERA RESULTS (Android Activity Kill recovery)
        try {
          const pending = await ImagePicker.getPendingResultAsync();
          if (pending && !pending.canceled && pending.assets && pending.assets.length > 0) {
            const asset = pending.assets[0];
            logger.info(`[APP] Recovered pending camera result: ${asset.uri}`);
            // Small delay to ensure DB and other systems are ready
            setTimeout(async () => {
              try {
                await knowledgePipeline.ingestImage(asset.uri);
                Alert.alert('Success', 'Interrupted scan recovered and processed successfully!');
              } catch (err) {
                logger.error('[APP] Failed to process recovered image', err);
              }
            }, 1000);
          }
        } catch (pendingErr) {
          logger.warn('[APP] No pending camera results found or failed to check', pendingErr);
        }

        // BACKGROUND MODEL LOADING:
        // Trigger model loading immediately after status check.
        // This ensures the AI is ready before the user even opens the chat.
        const { state, loadModel } = useAIModelStore.getState();
        if (state === 'READY') {
          logger.info('[APP] App launch: Pre-loading local AI model in background...');
          // Delay loading slightly to prioritize UI responsiveness and recovery
          setTimeout(() => {
            loadModel().catch(err => logger.warn('[APP] Background model load failed', err));
          }, 2000);
        }

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
