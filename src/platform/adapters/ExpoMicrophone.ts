import { IMicrophoneProvider } from '../interfaces/Microphone';
import { logger } from '../../core/logging/Logger';
import { createWavHeader } from '../../shared/utils/WavHelper';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system/legacy';

// SDK 57 uses expo-audio
let Audio: any;
try {
  Audio = require('expo-audio');
} catch (e) {
  logger.warn('expo-audio module not found or native module missing');
}

export class ExpoMicrophone implements IMicrophoneProvider {
  private recorder: any = null;
  private stream: any = null;
  private audioChunks: Buffer[] = [];
  private isStreamMode = false;

  async requestPermissions(): Promise<boolean> {
    if (!Audio) return false;

    try {
      // Modern expo-audio names
      const getPermissions = Audio.getRecordingPermissionsAsync || Audio.getPermissionsAsync;
      const requestPermissions = Audio.requestRecordingPermissionsAsync || Audio.requestPermissionsAsync;

      if (!getPermissions || !requestPermissions) {
        logger.error('Audio permission methods not found in module');
        return false;
      }

      // Check current status first
      const current = await getPermissions();
      if (current.granted || current.status === 'granted') return true;

      // If not granted, request it
      const { status, granted } = await requestPermissions();
      return granted || status === 'granted';
    } catch (error) {
      logger.error('Failed to request microphone permissions', error);
      return false;
    }
  }

  async startRecording(): Promise<void> {
    if (!Audio) throw new Error('Microphone not available in this environment');
    try {
      const setMode = Audio.setAudioModeAsync;
      if (setMode) {
        await setMode({
          allowsRecording: true,
          playsInSilentMode: true,
        });
      }

      // Modern API: createRecorder
      // Use AudioStream for high-compatibility PCM/WAV (Required for Local Whisper)
      if (Audio.AudioModule?.AudioStream) {
        logger.info('[Microphone] Starting PCM Stream (16kHz Mono)...');
        this.isStreamMode = true;
        this.audioChunks = [];

        this.stream = new Audio.AudioModule.AudioStream({
          sampleRate: 16000,
          channels: 1,
          encoding: 'int16',
        });

        this.stream.addListener('audioStreamBuffer', (buffer: any) => {
          this.audioChunks.push(Buffer.from(buffer.data));
        });

        await this.stream.start();
      }
      else if (Audio.AudioModule?.AudioRecorder) {
        this.isStreamMode = false;
        this.recorder = new Audio.AudioModule.AudioRecorder(
          Audio.RecordingPresets?.HIGH_QUALITY || {}
        );
        await this.recorder.prepareToRecordAsync();
        this.recorder.record();
      }
      // Legacy fallback
      else if (Audio.Recording?.createAsync) {
        this.isStreamMode = false;
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets?.HIGH_QUALITY || {}
        );
        this.recorder = recording;
      } else {
        throw new Error('No recording API found in Audio module');
      }
    } catch (error) {
      logger.error('Failed to start recording', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (this.isStreamMode && this.stream) {
        this.stream.stop();

        const dataBuffer = Buffer.concat(this.audioChunks);
        const header = createWavHeader(dataBuffer.length, 16000, 1);
        const wavFile = Buffer.concat([header, dataBuffer]);

        const filename = `recording_${Date.now()}.wav`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;

        // Write the WAV file to storage
        await FileSystem.writeAsStringAsync(fileUri, wavFile.toString('base64'), {
          encoding: FileSystem.EncodingType.Base64,
        });

        logger.info(`[Microphone] WAV Recording saved: ${fileUri} (${wavFile.length} bytes)`);

        this.stream = null;
        this.audioChunks = [];
        return fileUri;
      }

      if (!this.recorder) return null;
      let uri: string | null = null;

      // Modern stop
      if (typeof this.recorder.stop === 'function' && !this.recorder.stopAndUnloadAsync) {
        await this.recorder.stop();
        uri = this.recorder.uri;
        if (typeof this.recorder.release === 'function') {
          this.recorder.release();
        }
      }
      // Legacy stop
      else if (typeof this.recorder.stopAndUnloadAsync === 'function') {
        await this.recorder.stopAndUnloadAsync();
        uri = this.recorder.getURI();
      }

      this.recorder = null;
      return uri;
    } catch (error) {
      logger.error('Failed to stop recording', error);
      return null;
    }
  }

  async pauseRecording(): Promise<void> {
    if (this.isStreamMode) {
      logger.warn('Pause not supported in PCM Stream mode');
      return;
    }
    if (!this.recorder) return;
    if (typeof this.recorder.pause === 'function') {
      this.recorder.pause();
    } else if (typeof this.recorder.pauseAsync === 'function') {
      await this.recorder.pauseAsync();
    }
  }

  async resumeRecording(): Promise<void> {
    if (this.isStreamMode) return;
    if (!this.recorder) return;
    if (typeof this.recorder.record === 'function') {
      this.recorder.record();
    } else if (typeof this.recorder.startAsync === 'function') {
      await this.recorder.startAsync();
    }
  }
}
