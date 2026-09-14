import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/design/theme/ThemeContext';
import { Button } from '@/design/components/Button';
import { Card } from '@/design/components/Card';
import { ProgressBar } from '@/design/components/ProgressBar';
import { useWhisperModelStore } from '@/ai/WhisperModelManager';
import { useRouter } from 'expo-router';

export default function STTSetupScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, progress, error, downloadModel } = useWhisperModelStore();

  const isDownloading = state === 'DOWNLOADING';
  const isReady = state === 'READY';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.header, { paddingTop: insets.top + 32 }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Speech-to-Text Setup</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Memora uses a local Whisper model for accurate, offline voice transcription.
        </Text>
      </View>

      <Card style={styles.modelCard}>
        <Text style={[styles.modelName, { color: theme.colors.text }]}>Whisper Tiny (EN)</Text>
        <Text style={[styles.modelInfo, { color: theme.colors.textSecondary }]}>
          Size: ~75 MB (High Precision)
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
            <Text style={[styles.readyText, { color: theme.colors.success }]}>Whisper Ready!</Text>
            <Button
              title="Continue"
              onPress={() => router.back()}
              style={styles.button}
            />
          </View>
        ) : (
          <View>
            <Button
              title="Download Whisper Model"
              onPress={downloadModel}
              style={styles.button}
            />
            {error && <Text style={{ color: theme.colors.error, marginTop: 8 }}>{error}</Text>}
          </View>
        )}
      </Card>

      {!isDownloading && !isReady && (
        <Button
          title="Go Back"
          variant="ghost"
          onPress={() => router.back()}
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
