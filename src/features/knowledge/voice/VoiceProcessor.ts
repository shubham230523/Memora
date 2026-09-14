import { Platform } from '../../../platform/Platform';
import { logger } from '../../../core/logging/Logger';
import { geminiSTTAdapter } from '../../../ai/adapters/GeminiSTTAdapter';
import { whisperSTTAdapter } from '../../../ai/adapters/WhisperSTTAdapter';
import { useSettingsStore } from '../../settings/SettingsStore';

export class VoiceProcessor {
  async startRecording() {
    const hasPermission = await Platform.Microphone.requestPermissions();
    if (!hasPermission) throw new Error('Microphone permission denied');
    await Platform.Microphone.startRecording();
  }

  async stopRecording(): Promise<string | null> {
    return await Platform.Microphone.stopRecording();
  }

  async transcribe(uri: string): Promise<string> {
    if (!uri) throw new Error('No audio URI provided for transcription');

    const { inferenceMode } = useSettingsStore.getState();
    logger.info(`[VoiceProcessor] Starting transcription in ${inferenceMode} mode for: ${uri}`);

    try {
      if (inferenceMode === 'LOCAL') {
        return await whisperSTTAdapter.transcribe(uri);
      } else {
        // Cloud Fallback (Gemini)
        // 1. Read file as base64
        const base64 = await Platform.FileSystem.readAsBase64(uri);

        // 2. Determine mime type from extension
        const extension = uri.split('.').pop()?.toLowerCase() || 'm4a';
        const mimeType = `audio/${extension === 'mp3' ? 'mpeg' : extension}`;

        // 3. Transcribe via Gemini
        const transcription = await geminiSTTAdapter.transcribe(base64, mimeType);

        if (!transcription || transcription.length === 0) {
          return "No speech detected in this recording.";
        }

        return transcription;
      }
    } catch (error) {
      logger.error('[VoiceProcessor] Transcription failed', error);
      throw error;
    }
  }
}

export const voiceProcessor = new VoiceProcessor();
