import { OpenRouterAdapter } from '../adapters/OpenRouterAdapter';

describe('OpenRouterAdapter', () => {
  it('throws error if API  key is missing', async () => {
    // Force missing API key by overriding config if necessary or just testing default
    const adapter = new OpenRouterAdapter();
    // Assuming no key in test environment
    await expect(adapter.generate({ prompt: 'hi' })).rejects.toThrow('OpenRouter API key is missing');
  });
});
