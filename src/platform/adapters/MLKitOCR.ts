import { IOCRProvider } from '../interfaces/OCR';
import { recognizeText } from '@dariyd/react-native-text-recognition';
import { logger } from '../../core/logging/Logger';

export class MLKitOCR implements IOCRProvider {
  async recognizeText(imageUri: string): Promise<string> {
    try {
      logger.info(`ML Kit OCR starting for: ${imageUri}`);
      const result = await recognizeText(imageUri);
      return result.text || "";
    } catch (error) {
      logger.error('ML Kit OCR failed', error);
      return "";
    }
  }
}
