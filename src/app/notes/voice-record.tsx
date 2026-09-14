import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/design/theme/ThemeContext';
import { Icon } from '@/design/components/Icon';
import { Platform } from '@/platform/Platform';
import { knowledgePipeline } from '@/features/knowledge/KnowledgePipeline';
import { useKnowledgeStore } from '@/features/knowledge/KnowledgeStore';
import { logger } from '@/core/logging/Logger';
import { Loading } from '@/design/components/Loading';

export default function VoiceRecordScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const { isLoading, loadingLabel } = useKnowledgeStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        const uri = await Platform.Microphone.stopRecording();
        setIsRecording(false);
        if (uri) {
          await knowledgePipeline.ingestVoice(uri);
          Alert.alert('Success', 'Voice note captured and transcribed');
          router.back();
        }
      } else {
        const hasPermission = await Platform.Microphone.requestPermissions();
        if (hasPermission) {
          await Platform.Microphone.startRecording();
          setIsRecording(true);
          setDuration(0);
        } else {
          Alert.alert(
            'Permission Denied',
            'Microphone access is required to record voice notes. Please enable it in your phone settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Settings', onPress: () => Linking.openSettings() }
            ]
          );
        }
      }
    } catch (error) {
      logger.error('Failed to handle voice recording', error);
      Alert.alert('Error', 'Failed to record voice note');
      setIsRecording(false);
    }
  };

  const pickAudioFile = async () => {
    try {
      const result = await Platform.FilePicker.pickDocument({
        type: ['audio/wav', 'audio/x-wav', 'audio/wave']
      });

      if (result) {
        const isWav = result.name.toLowerCase().endsWith('.wav');
        if (!isWav) {
          Alert.alert('Unsupported Format', 'Only .wav files are supported for local transcription.');
          return;
        }

        await knowledgePipeline.ingestVoice(result.uri);
        Alert.alert('Success', 'Audio file processed and transcribed');
        router.back();
      }
    } catch (error) {
      logger.error('Failed to pick audio file', error);
      Alert.alert('Error', 'Failed to process audio file');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Icon name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Voice Note</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.timerContainer, isRecording && { borderColor: theme.colors.error }]}>
          <Text style={[styles.timerText, { color: theme.colors.text }]}>
            {formatDuration(duration)}
          </Text>
          {isRecording && <View style={[styles.recordingDot, { backgroundColor: theme.colors.error }]} />}
        </View>

        <Text style={[styles.instruction, { color: theme.colors.textSecondary }]}>
          {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
        </Text>

        <TouchableOpacity
          onPress={toggleRecording}
          style={[
            styles.recordButton,
            { backgroundColor: isRecording ? theme.colors.error : theme.colors.primary }
          ]}
        >
          <Icon name={isRecording ? "stop" : "microphone"} size={40} color="#FFF" />
        </TouchableOpacity>

        {!isRecording && (
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={pickAudioFile}
              style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
            >
              <Icon name="file-upload" size={24} color={theme.colors.primary} />
              <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                Select .wav file
              </Text>
            </TouchableOpacity>
            <Text style={[styles.supportText, { color: theme.colors.textSecondary }]}>
              (Only .wav supported)
            </Text>
          </View>
        )}
      </View>

      {isLoading && (
        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay, { backgroundColor: theme.colors.background + 'CC' }]}>
          <Loading message={loadingLabel} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  closeButton: { position: 'absolute', left: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  timerContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  timerText: { fontSize: 48, fontWeight: 'bold' },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: 40,
  },
  instruction: { fontSize: 16, marginBottom: 40 },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginBottom: 40,
  },
  footer: {
    alignItems: 'center',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  supportText: {
    marginTop: 8,
    fontSize: 12,
  },
  loadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
