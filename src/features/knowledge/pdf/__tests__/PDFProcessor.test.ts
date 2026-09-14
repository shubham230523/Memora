import { PDFProcessor } from '../PDFProcessor';
import * as TextRecognition from '@dariyd/react-native-text-recognition';
import * as DigitalExtract from 'expo-pdf-text-extract';
import { Platform } from '../../../../platform/Platform';

jest.mock('@dariyd/react-native-text-recognition', () => ({
  recognizeText: jest.fn(),
}));

jest.mock('expo-pdf-text-extract', () => ({
  extractText: jest.fn(),
  isAvailable: jest.fn().mockReturnValue(true),
  getPageCount: jest.fn().mockResolvedValue(5),
}));

jest.mock('../../../../platform/Platform', () => ({
  Platform: {
    FileSystem: {
      documentDirectory: 'file:///docs/',
      copyFile: jest.fn(),
      deleteFile: jest.fn(),
      getContentUri: jest.fn().mockResolvedValue('content://uri'),
    },
  },
}));

describe('PDFProcessor', () => {
  let processor: PDFProcessor;

  beforeEach(() => {
    processor = new PDFProcessor();
    jest.clearAllMocks();
  });

  it('process should use Vision engine if available and successful', async () => {
    (TextRecognition.recognizeText as jest.Mock).mockResolvedValue({
      success: true,
      fullText: 'Extracted via Vision'
    });

    const result = await processor.process('test-uri');

    expect(result).toBe('Extracted via Vision');
    expect(TextRecognition.recognizeText).toHaveBeenCalled();
    expect(Platform.FileSystem.copyFile).toHaveBeenCalled();
  });

  it('process should fallback to Digital engine if Vision fails', async () => {
    (TextRecognition.recognizeText as jest.Mock).mockResolvedValue({ success: false });
    (DigitalExtract.extractText as jest.Mock).mockResolvedValue('Extracted via Digital');

    const result = await processor.process('test-uri');

    expect(result).toBe('Extracted via Digital');
    expect(DigitalExtract.extractText).toHaveBeenCalled();
  });

  it('statisticalUntangle should detect multi-column layout', async () => {
    // Generate text that looks like 2 columns
    let multiColumnText = '';
    for (let i = 0; i < 20; i++) {
      multiColumnText += `Left Column Line ${i}    Right Column Line ${i}\n`;
    }

    const result = (processor as any).statisticalUntangle(multiColumnText);
    expect(result.detected).toBe(true);
    expect(result.text).toContain('--- COLUMN BREAK ---');
  });

  it('statisticalUntangle should not detect columns if gap is inconsistent', async () => {
    const singleColumnText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10';
    const result = (processor as any).statisticalUntangle(singleColumnText);
    expect(result.detected).toBe(false);
  });

  it('cleanDigitalText should return untangled text if columns detected', () => {
    let multiColumnText = '';
    for (let i = 0; i < 20; i++) {
      multiColumnText += `Left Column Line ${i}    Right Column Line ${i}\n`;
    }

    const result = (processor as any).cleanDigitalText(multiColumnText);
    expect(result.wasUntangled).toBe(true);
    expect(result.text).toContain('--- COLUMN BREAK ---');
  });

  it('cleanDigitalText should return normally cleaned text if no columns detected', () => {
    const text = 'Simple text with some   extra spaces';
    const result = (processor as any).cleanDigitalText(text);
    expect(result.wasUntangled).toBe(false);
    expect(result.text).toBe('Simple text with some [COLUMN_GAP] extra spaces');
  });

  it('process should throw error if both engines fail to extract text', async () => {
    (TextRecognition.recognizeText as jest.Mock).mockResolvedValue({ success: false });
    (DigitalExtract.extractText as jest.Mock).mockResolvedValue('');

    await expect(processor.process('test-uri')).rejects.toThrow('All extraction engines failed');
  });

  it('statisticalUntangle should handle empty or short text', () => {
    const result = (processor as any).statisticalUntangle('');
    expect(result.detected).toBe(false);

    const shortResult = (processor as any).statisticalUntangle('Short text');
    expect(shortResult.detected).toBe(false);
  });
});
