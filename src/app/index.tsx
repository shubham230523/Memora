import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/features/settings/SettingsStore';
import { useAIModelStore } from '@/ai/AIModelManager';
import { View } from 'react-native';

export default function Index() {
  const { inferenceMode, _hasHydrated } = useSettingsStore();
  const { state } = useAIModelStore();

  // Wait for settings to hydrate to avoid wrong redirection
  if (!_hasHydrated) {
    return <View style={{ flex: 1 }} />;
  }

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
