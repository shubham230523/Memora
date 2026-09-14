import { ocrRefiner } from '../OCRRefiner';
import { useAIModelStore } from '../../../../ai/AIModelManager';
import { getAIProvider } from '../../../../ai/AIProviderFactory';

jest.mock('../../../../ai/AIProviderFactory', () => ({
  getAIProvider: jest.fn(),
}));

describe('OCRRefiner', () => {
  const mockAiProvider = {
    generate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getAIProvider as jest.Mock).mockReturnValue(mockAiProvider);
  });

  it('should return raw text if model is not loaded', async () => {
    useAIModelStore.setState({ state: 'NOT_INSTALLED' });
    const result = await ocrRefiner.refine('Raw text');
    expect(result).toBe('Raw text');
    expect(mockAiProvider.generate).not.toHaveBeenCalled();
  });

  it('should call AI model and return refined text if model is loaded', async () => {
    useAIModelStore.setState({ state: 'LOADED' });
    mockAiProvider.generate.mockResolvedValue({ text: 'Cleaned text' });

    const result = await ocrRefiner.refine('Raw text with noise');

    expect(result).toBe('Cleaned text');
    expect(mockAiProvider.generate).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.stringContaining('Raw text with noise'),
      systemPrompt: expect.stringContaining('precision OCR cleanup tool'),
    }));
  });

  it('should fallback to raw text if AI returns NO_CONTENT_FOUND', async () => {
    useAIModelStore.setState({ state: 'LOADED' });
    mockAiProvider.generate.mockResolvedValue({ text: 'NO_CONTENT_FOUND' });

    const result = await ocrRefiner.refine('Just symbols %%%');
    expect(result).toBe('Just symbols %%%');
  });

  it('should fallback to raw text if AI removes too much content', async () => {
    useAIModelStore.setState({ state: 'LOADED' });
    // Text is long (800 chars), AI returns only 10 chars
    const longText = 'A'.repeat(800);
    mockAiProvider.generate.mockResolvedValue({ text: 'too short' });

    const result = await ocrRefiner.refine(longText);
    expect(result).toBe(longText);
  });

  it('should fallback to raw text on AI failure', async () => {
    useAIModelStore.setState({ state: 'LOADED' });
    mockAiProvider.generate.mockRejectedValue(new Error('AI crash'));

    const result = await ocrRefiner.refine('Important info');
    expect(result).toBe('Important info');
  });
});
