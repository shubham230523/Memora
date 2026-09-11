import { ILocalAIProvider } from '../interfaces/LocalAI';
import { AIRequest, AIResponse, AIStreamChunk } from '../../ai/models/AIModels';
import { logger } from '../../core/logging/Logger';

// Note: llama.rn must be dynamically imported or handled carefully for web compatibility
let initLlama: any;
try {
  initLlama = require('llama.rn').initLlama;
} catch (e) {
  logger.warn('llama.rn not found, local AI will be disabled on this platform');
}

export class LlamaLocalAI implements ILocalAIProvider {
  private context: any = null;

  async isModelReady(): Promise<boolean> {
    return this.context !== null;
  }

  async loadModel(modelPath: string): Promise<void> {
    if (!initLlama) throw new Error('Local AI runtime not available');
    if (this.context) return;

    try {
      this.context = await initLlama({
        model: `file://${modelPath}`,
        use_mlock: true,
        n_ctx: 2048,
        n_gpu_layers: 1,
      });
      logger.info('Local model loaded');
    } catch (error) {
      logger.error('Failed to load local model', error);
      throw error;
    }
  }

  async unloadModel(): Promise<void> {
    if (this.context) {
      await this.context.release();
      this.context = null;
      logger.info('Local model unloaded');
    }
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!this.context) throw new Error('Model not loaded');

    let result = '';
    await this.context.completion(
      {
        prompt: request.prompt,
        n_predict: 512,
        temperature: request.temperature || 0.7,
      },
      (data: any) => {
        result += data.token;
      }
    );

    return { text: result };
  }

  async streamGenerate(request: AIRequest, onChunk: (chunk: AIStreamChunk) => void): Promise<void> {
    if (!this.context) throw new Error('Model not loaded');

    await this.context.completion(
      {
        prompt: request.prompt,
        n_predict: 512,
        temperature: request.temperature || 0.7,
      },
      (data: any) => {
        onChunk({ text: data.token, isFinal: false });
      }
    );

    onChunk({ text: '', isFinal: true });
  }
}
