import { OpenRouterAdapter } from '../OpenRouterAdapter';
import { appConfig } from '../../../core/config/appConfig';

jest.mock('../../../core/config/appConfig', () => ({
  appConfig: {
    ai: {
      openRouter: {
        apiKey: 'test-key',
      },
    },
  },
}));

global.fetch = jest.fn();

describe('OpenRouterAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (appConfig.ai.openRouter as any).apiKey = 'test-key';
  });

  it('should throw error if API key is missing', async () => {
    (appConfig.ai.openRouter as any).apiKey = undefined;
    const adapter = new OpenRouterAdapter();
    await expect(adapter.generate({ prompt: 'hi' } as any)).rejects.toThrow('OpenRouter API key is missing');
  });

  it('should return AIResponse on success', async () => {
    const adapter = new OpenRouterAdapter();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'hello back' } }],
        usage: { prompt_tokens: 10, completion_tokens: 5 }
      }),
    });

    const response = await adapter.generate({
      prompt: 'hello',
      systemPrompt: 'be nice',
      temperature: 0.7
    } as any);

    expect(response).toEqual({
      text: 'hello back',
      usage: { promptTokens: 10, completionTokens: 5 }
    });
    expect(fetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
        }),
      })
    );
  });

  it('should throw error if fetch fails', async () => {
    const adapter = new OpenRouterAdapter();
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    await expect(adapter.generate({ prompt: 'hello' } as any)).rejects.toThrow('OpenRouter request failed');
  });

  it('streamGenerate should call generate and onChunk', async () => {
    const adapter = new OpenRouterAdapter();
    const mockResponse = { text: 'hello', usage: { promptTokens: 1, completionTokens: 1 } };
    jest.spyOn(adapter, 'generate').mockResolvedValue(mockResponse);
    const onChunk = jest.fn();

    await adapter.streamGenerate({ prompt: 'hello' } as any, onChunk);

    expect(onChunk).toHaveBeenCalledWith({ text: 'hello', isFinal: true });
  });
});
