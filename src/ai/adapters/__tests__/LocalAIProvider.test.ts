import { LocalAIProvider } from '../LocalAIProvider';
import { Platform } from '../../../platform/Platform';
import { logger } from '../../../core/logging/Logger';

jest.mock('../../../platform/Platform', () => ({
  Platform: {
    LocalAI: {
      isModelReady: jest.fn(),
      generate: jest.fn(),
      streamGenerate: jest.fn(),
    },
  },
}));

jest.mock('../../../core/logging/Logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('LocalAIProvider', () => {
  let provider: LocalAIProvider;

  beforeEach(() => {
    provider = new LocalAIProvider();
    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('should throw error if model is not ready', async () => {
      (Platform.LocalAI.isModelReady as jest.Mock).mockResolvedValue(false);

      await expect(provider.generate({ prompt: 'hello' } as any)).rejects.toThrow(
        'Local AI model not loaded. Please go to AI Setup.'
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it('should call Platform.LocalAI.generate if ready', async () => {
      (Platform.LocalAI.isModelReady as jest.Mock).mockResolvedValue(true);
      (Platform.LocalAI.generate as jest.Mock).mockResolvedValue({ text: 'response' });

      const response = await provider.generate({ prompt: 'hello' } as any);

      expect(response).toEqual({ text: 'response' });
      expect(Platform.LocalAI.generate).toHaveBeenCalledWith({ prompt: 'hello' });
    });
  });

  describe('streamGenerate', () => {
    it('should throw error if model is not ready', async () => {
      (Platform.LocalAI.isModelReady as jest.Mock).mockResolvedValue(false);

      await expect(provider.streamGenerate({ prompt: 'hello' } as any, jest.fn())).rejects.toThrow(
        'Local AI model not loaded.'
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it('should call Platform.LocalAI.streamGenerate if ready', async () => {
      (Platform.LocalAI.isModelReady as jest.Mock).mockResolvedValue(true);
      const onChunk = jest.fn();

      await provider.streamGenerate({ prompt: 'hello' } as any, onChunk);

      expect(Platform.LocalAI.streamGenerate).toHaveBeenCalledWith({ prompt: 'hello' }, onChunk);
    });
  });
});
