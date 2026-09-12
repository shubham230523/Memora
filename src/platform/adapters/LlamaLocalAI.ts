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
  private isMock: boolean = false;

  async isModelReady(): Promise<boolean> {
    return this.context !== null || this.isMock;
  }

  async loadModel(modelPath: string): Promise<void> {
    if (!initLlama) {
      logger.warn('Native Local AI runtime not found. Enabling Mock Mode for UI testing.');
      this.isMock = true;
      return;
    }

    if (this.context) return;

    try {
      // In SDK 57 / llama.rn, initializing with a non-existent path will throw.
      // We ensure the path is correctly formatted for llama.rn
      const formattedPath = modelPath.startsWith('file://') ? modelPath : `file://${modelPath}`;

      this.context = await initLlama({
        model: formattedPath,
        use_mlock: true,
        n_ctx: 2048,
        n_gpu_layers: 1,
      });
      logger.info('Local model loaded');
    } catch (error) {
      logger.warn('Failed to load real local model (likely because simulation file is missing). Falling back to Mock Mode.', error);
      this.isMock = true;
    }
  }

  async unloadModel(): Promise<void> {
    if (this.context) {
      await this.context.release();
      this.context = null;
    }
    this.isMock = false;
    logger.info('Local model unloaded');
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (this.isMock) {
      await new Promise(r => setTimeout(r, 1500)); // Simulate think time
      return { text: "I'm running in mock mode because the native llama.rn library is missing. Please create a development build to use real local AI!" };
    }

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
    if (this.isMock) {
      const text = "I'm running in mock mode. Real AI requires a development build.";
      for (const char of text.split(' ')) {
        await new Promise(r => setTimeout(r, 50));
        onChunk({ text: char + ' ', isFinal: false });
      }
      onChunk({ text: '', isFinal: true });
      return;
    }

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
