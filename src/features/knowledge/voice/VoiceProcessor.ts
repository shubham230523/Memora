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
      // Check if file exists and get size for debugging
      const exists = await Platform.FileSystem.exists(uri);
      if (!exists) {
        logger.error(`[VoiceProcessor] Audio file does not exist at path: ${uri}`);
        throw new Error('Audio file not found');
      }

      if (inferenceMode === 'LOCAL') {
        logger.debug(`[VoiceProcessor] Invoking local Whisper adapter for URI: ${uri}`);
        return await whisperSTTAdapter.transcribe(uri);
      } else {
        logger.info('[VoiceProcessor] Falling back to Gemini cloud transcription');
        // Cloud Fallback (Gemini)
        // 1. Read file as base64
        const base64 = await Platform.FileSystem.readAsBase64(uri);
        logger.debug(`[VoiceProcessor] File read as base64, length: ${base64.length}`);

        // 2. Determine mime type from extension
        const extension = uri.split('.').pop()?.toLowerCase() || 'm4a';
        const mimeType = `audio/${extension === 'mp3' ? 'mpeg' : extension}`;
        logger.debug(`[VoiceProcessor] Detected mime type: ${mimeType}`);

        // 3. Transcribe via Gemini
        const transcription = await geminiSTTAdapter.transcribe(base64, mimeType);
        logger.info(`[VoiceProcessor] Gemini transcription result: ${transcription?.substring(0, 50)}...`);

        if (!transcription || transcription.length === 0) {
          logger.warn('[VoiceProcessor] Gemini returned empty transcription');
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
