import { IAIProvider } from '../interfaces/AIProvider';
import { AIRequest, AIResponse, AIStreamChunk } from '../models/AIModels';
import { Platform } from '../../platform/Platform';
import { logger } from '../../core/logging/Logger';

export class LocalAIProvider implements IAIProvider {
  async generate(request: AIRequest): Promise<AIResponse> {
    try {
      const isReady = await Platform.LocalAI.isModelReady();
      if (!isReady) {
        throw new Error('Local AI model not loaded. Please go to AI Setup.');
      }
      return await Platform.LocalAI.generate(request);
    } catch (error) {
      logger.error('Local AI generate failed', error);
      throw error;
    }
  }

  async streamGenerate(request: AIRequest, onChunk: (chunk: AIStreamChunk) => void): Promise<void> {
    try {
      const isReady = await Platform.LocalAI.isModelReady();
      if (!isReady) {
        throw new Error('Local AI model not loaded.');
      }
      await Platform.LocalAI.streamGenerate(request, onChunk);
    } catch (error) {
      logger.error('Local AI stream generate failed', error);
      throw error;
    }
  }
}
