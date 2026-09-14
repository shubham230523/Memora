import { MLKitOCR } from '../MLKitOCR';
import { recognizeText } from '@dariyd/react-native-text-recognition';
import { logger } from '../../../core/logging/Logger';

jest.mock('@dariyd/react-native-text-recognition', () => ({
  recognizeText: jest.fn(),
}));

jest.mock('../../../core/logging/Logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('MLKitOCR', () => {
  let ocr: MLKitOCR;

  beforeEach(() => {
    ocr = new MLKitOCR();
    jest.clearAllMocks();
  });

  it('should return full text on success', async () => {
    (recognizeText as jest.Mock).mockResolvedValue({
      success: true,
      fullText: 'Success Text'
    });

    const result = await ocr.recognizeText('uri');
    expect(result).toBe('Success Text');
  });

  it('should return empty string and log error on failure', async () => {
    (recognizeText as jest.Mock).mockResolvedValue({
      success: false,
      error: true,
      errorMessage: 'Error'
    });

    const result = await ocr.recognizeText('uri');
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle fatal exceptions', async () => {
    (recognizeText as jest.Mock).mockRejectedValue(new Error('fatal'));
    const result = await ocr.recognizeText('uri');
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalled();
  });
});
