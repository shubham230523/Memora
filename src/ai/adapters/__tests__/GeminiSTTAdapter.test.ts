import { GeminiSTTAdapter } from '../GeminiSTTAdapter';
import { appConfig } from '../../../core/config/appConfig';

jest.mock('../../../core/logging/Logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../core/config/appConfig', () => ({
  appConfig: {
    ai: {
      gemini: {
        apiKey: 'test-api-key',
      },
    },
  },
}));

describe('GeminiSTTAdapter', () => {
  let adapter: GeminiSTTAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    global.fetch = jest.fn();
    adapter = new GeminiSTTAdapter();
  });

  it('should throw error if API key is missing', async () => {
    // @ts-ignore
    adapter.apiKey = undefined;
    await expect(adapter.transcribe('data')).rejects.toThrow('Gemini API key is missing');
  });

  it('should call Gemini API and return text', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{
          content: { parts: [{ text: 'Hello world' }] }
        }]
      })
    });

    const result = await adapter.transcribe('base64', 'audio/m4a');

    expect(result).toBe('Hello world');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('gemini-1.5-flash'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('base64'),
      })
    );
  });

  it('should handle API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ error: 'message' })
    });

    await expect(adapter.transcribe('data')).rejects.toThrow('Gemini STT failed');
  });
});
