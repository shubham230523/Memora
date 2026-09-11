import { IEmbeddingProvider } from '../interfaces/EmbeddingProvider';
import { appConfig } from '../../core/config/appConfig';

export class OpenRouterEmbeddingAdapter implements IEmbeddingProvider {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = appConfig.ai.openRouter.apiKey;
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    // OpenRouter doesn't have a direct embedding endpoint for all models,
    // but some models support it.
    // For now, placeholder or use a different service.
    return Array(1536).fill(0).map(() => Math.random());
  }
}
