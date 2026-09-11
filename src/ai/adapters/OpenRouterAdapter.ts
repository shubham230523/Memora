import { IAIProvider } from '../interfaces/AIProvider';
import { AIRequest, AIResponse, AIStreamChunk } from '../models/AIModels';
import { appConfig } from '../../core/config/appConfig';
import { AppError, ErrorCode } from '../../core/errors/AppError';

export class OpenRouterAdapter implements IAIProvider {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = appConfig.ai.openRouter.apiKey;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new AppError(ErrorCode.AI_PROVIDER, 'OpenRouter API key is missing');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-pro-1.5',
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.prompt },
        ],
        temperature: request.temperature,
      }),
    });

    if (!response.ok) {
      throw new AppError(ErrorCode.AI_PROVIDER, 'OpenRouter request failed');
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
      },
    };
  }

  async streamGenerate(request: AIRequest, onChunk: (chunk: AIStreamChunk) => void): Promise<void> {
    // SSE implementation would go here
    // For now, simple simulation
    const response = await this.generate(request);
    onChunk({ text: response.text, isFinal: true });
  }
}
