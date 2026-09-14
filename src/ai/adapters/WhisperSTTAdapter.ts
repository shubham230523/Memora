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
        this.context = await initWhisper({
          filePath: getModelUri(),
        });
      }

      logger.info(`[Whisper] Transcribing: ${uri}`);
      const task = this.context.transcribe(uri, {
        language: 'en',
        maxTokens: 1024,
      });

      const { text } = await task.promise;

      return text.trim();
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
