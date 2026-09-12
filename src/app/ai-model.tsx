import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/design/theme/ThemeContext';
import { Button } from '@/design/components/Button';
import { Card } from '@/design/components/Card';
import { ProgressBar } from '@/design/components/ProgressBar';
import { useAIModelStore } from '@/ai/AIModelManager';
import { useRouter } from 'expo-router';

export default function AIModelScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, progress, error, downloadModel } = useAIModelStore();

  const isDownloading = state === 'DOWNLOADING';
  const isReady = state === 'READY' || state === 'LOADED';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.header, { paddingTop: insets.top + 32 }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>AI Model Setup</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Memora uses a local AI model for privacy and offline use.
        </Text>
      </View>

      <Card style={styles.modelCard}>
        <Text style={[styles.modelName, { color: theme.colors.text }]}>Qwen 2.5 0.5B</Text>
        <Text style={[styles.modelInfo, { color: theme.colors.textSecondary }]}>
          Size: ~350 MB
        </Text>

        {isDownloading ? (
          <View style={styles.progressContainer}>
            <ProgressBar progress={progress} />
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {Math.round(progress * 100)}% downloaded
            </Text>
          </View>
        ) : isReady ? (
          <View style={styles.readyContainer}>
            <Text style={[styles.readyText, { color: theme.colors.success }]}>Model Ready!</Text>
            <Button
              title="Continue to App"
              onPress={() => router.replace('/(tabs)')}
              style={styles.button}
            />
          </View>
        ) : (
          <View>
            <Button
              title="Download Model"
              onPress={downloadModel}
              style={styles.button}
            />
            {error && <Text style={{ color: theme.colors.error, marginTop: 8 }}>{error}</Text>}
          </View>
        )}
      </Card>

      {!isDownloading && !isReady && (
        <Button
          title="I'll do this later"
          variant="ghost"
          onPress={() => router.replace('/(tabs)')}
          style={styles.skipButton}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 32, paddingBottom: 32, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  modelCard: { margin: 24, padding: 24 },
  modelName: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modelInfo: { fontSize: 14, marginBottom: 24 },
  progressContainer: { marginTop: 8 },
  progressText: { fontSize: 12, marginTop: 8, textAlign: 'center' },
  readyContainer: { alignItems: 'center' },
  readyText: { fontWeight: 'bold', marginBottom: 16 },
  button: { marginTop: 8, width: '100%' },
  skipButton: { marginTop: 16 },
});
