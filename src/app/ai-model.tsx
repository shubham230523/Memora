import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/design/theme/ThemeContext';
import { Button } from '@/design/components/Button';
import { Card } from '@/design/components/Card';
import { ProgressBar } from '@/design/components/ProgressBar';
import { useRouter } from 'expo-router';

export default function AIModelScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate download
    let p = 0;
    const interval = setInterval(() => {
      p += 0.05;
      setDownloadProgress(p);
      if (p >= 1) {
        clearInterval(interval);
        setIsDownloading(false);
        // router.replace('/(tabs)');
      }
    }, 200);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>AI Model Setup</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Memora uses a local AI model for privacy and offline use.
        </Text>
      </View>

      <Card style={styles.modelCard}>
        <Text style={[styles.modelName, { color: theme.colors.text }]}>Qwen 2.5 1.5B</Text>
        <Text style={[styles.modelInfo, { color: theme.colors.textSecondary }]}>
          Size: ~1.1 GB
        </Text>

        {isDownloading ? (
          <View style={styles.progressContainer}>
            <ProgressBar progress={downloadProgress} />
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {Math.round(downloadProgress * 100)}% downloaded
            </Text>
          </View>
        ) : (
          <Button
            title="Download Model"
            onPress={handleDownload}
            style={styles.button}
          />
        )}
      </Card>

      <Button
        title="I'll do this later"
        variant="ghost"
        onPress={() => router.replace('/(tabs)')}
        style={styles.skipButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 32, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  modelCard: { margin: 24, padding: 24 },
  modelName: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modelInfo: { fontSize: 14, marginBottom: 24 },
  progressContainer: { marginTop: 8 },
  progressText: { fontSize: 12, marginTop: 8, textAlign: 'center' },
  button: { marginTop: 8 },
  skipButton: { marginTop: 16 },
});
