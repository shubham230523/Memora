import { ExpoFilePicker } from '../ExpoFilePicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { logger } from '../../../core/logging/Logger';

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('../../../core/logging/Logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ExpoFilePicker', () => {
  let filePicker: ExpoFilePicker;

  beforeEach(() => {
    filePicker = new ExpoFilePicker();
    jest.clearAllMocks();
  });

  describe('pickDocument', () => {
    it('should return file info on success', async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'doc-uri', name: 'test.pdf', mimeType: 'application/pdf', size: 123 }]
      });

      const result = await filePicker.pickDocument();
      expect(result).toEqual({ uri: 'doc-uri', name: 'test.pdf', mimeType: 'application/pdf', size: 123 });
    });

    it('should return null if canceled', async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({ canceled: true });
      const result = await filePicker.pickDocument();
      expect(result).toBeNull();
    });
  });

  describe('pickImage', () => {
    it('should return image info on success', async () => {
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'img-uri', fileName: 'test.jpg', mimeType: 'image/jpeg', fileSize: 456 }]
      });

      const result = await filePicker.pickImage();
      expect(result).toEqual({ uri: 'img-uri', name: 'test.jpg', mimeType: 'image/jpeg', size: 456 });
    });
  });
});
