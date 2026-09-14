import { STTProvider } from '../interfaces/STTProvider';
import { logger } from '../../core/logging/Logger';
import { useWhisperModelStore } from '../WhisperModelManager';

let initWhisper: any;
try {
  initWhisper = require('whisper.rn').initWhisper;
} catch (e) {
  logger.warn('whisper.rn not found. Local STT will use fallback.');
}

export class WhisperSTTAdapter implements STTProvider {
  private context: any = null;

  async transcribe(uri: string): Promise<string> {
    if (!initWhisper) {
      throw new Error('Whisper native module is not installed.');
    }

    const { state, getModelUri } = useWhisperModelStore.getState();
    if (state !== 'READY') {
      throw new Error('Whisper model is not downloaded. Please go to Settings.');
    }

    try {
      if (!this.context) {
        logger.info('[Whisper] Initializing context...');
        const modelUri = getModelUri();
        // Native modules often need a plain path on Android
        const cleanModelPath = modelUri.startsWith('file://') ? modelUri.replace('file://', '') : modelUri;

        this.context = await initWhisper({
          filePath: cleanModelPath,
        });
      }

      // Remove file:// prefix for Android native compatibility
      const cleanUri = uri.startsWith('file://') ? uri.replace('file://', '') : uri;

      logger.info(`[Whisper] Starting transcription task for: ${cleanUri}`);
      const task = this.context.transcribe(cleanUri, {
        language: 'en',
        maxTokens: 1024,
      });

      logger.debug('[Whisper] Awaiting transcription promise...');
      const result = await task.promise;
      logger.info('[Whisper] Transcription promise resolved');

      if (!result || typeof result.text !== 'string') {
        logger.warn('[Whisper] Transcription result missing or invalid text property. Full result:', result);
        return '';
      }

      const transcribedText = result.text.trim();
      logger.info(`[Whisper] Transcription successful, length: ${transcribedText.length} chars`);
      return transcribedText;
    } catch (error) {
      logger.error('[Whisper] Transcription failed', error);
      throw error;
    }
  }

  async release() {
    if (this.context) {
      await this.context.release();
      this.context = null;
    }
  }
}

export const whisperSTTAdapter = new WhisperSTTAdapter();
