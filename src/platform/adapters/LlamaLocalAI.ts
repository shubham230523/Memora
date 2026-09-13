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
        use_mlock: false, // Set to false to prevent OOM on mid-range devices
        n_ctx: 2048,      // Increased context size for better knowledge density
        n_gpu_layers: 0,  // Disable GPU offloading for stability on shared RAM devices
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

    const fullPrompt = this.formatPrompt(request);
    logger.debug(`[AI] Final Prompt sent to model:\n${fullPrompt}`);

    let result = '';
    await this.context.completion(
      {
        prompt: fullPrompt,
        n_predict: 2048, // Increased to allow full document output
        temperature: 0.1, // Low but stable for natural extraction
        stop: ['<|im_end|>', '<|endoftext|>'],
      },
      (data: any) => {
        result += data.token;
      }
    );

    return { text: result.trim() };
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

    const fullPrompt = this.formatPrompt(request);
    logger.debug(`[AI] Final Prompt (stream) sent to model:\n${fullPrompt}`);

    await this.context.completion(
      {
        prompt: fullPrompt,
        n_predict: 256,
        temperature: 0.1, // Low but stable for natural extraction
        stop: ['<|im_end|>', '<|endoftext|>'],
      },
      (data: any) => {
        onChunk({ text: data.token, isFinal: false });
      }
    );

    onChunk({ text: '', isFinal: true });
  }

  private formatPrompt(request: AIRequest): string {
    // Qwen/Llama Chat Template with History support
    let prompt = `<|im_start|>system
${request.systemPrompt || 'You are a helpful assistant.'}<|im_end|>\n`;

    if (request.history && request.history.length > 0) {
      for (const msg of request.history) {
        prompt += `<|im_start|>${msg.role}\n${msg.content}<|im_end|>\n`;
      }
    }

    prompt += `<|im_start|>user
${request.prompt}<|im_end|>
<|im_start|>assistant`;

    return prompt;
  }
}
