import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/features/settings/SettingsStore';
import { useAIModelStore } from '@/ai/AIModelManager';

export default function Index() {
  const { inferenceMode } = useSettingsStore();
  const { state, checkStatus } = useAIModelStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkStatus().then(() => setIsReady(true));
  }, [checkStatus]);

  if (!isReady) return null;

  // Logic to check if user is authenticated
  const isAuthenticated = true; // Placeholder

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Smart Onboarding for local model
  if (inferenceMode === 'LOCAL' && state === 'NOT_INSTALLED') {
    return <Redirect href="/ai-model" />;
  }

  return <Redirect href="/(tabs)" />;
}
