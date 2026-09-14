import { IOCRProvider } from '../interfaces/OCR';
import { recognizeText } from '@dariyd/react-native-text-recognition';
import { logger } from '../../core/logging/Logger';

export class MLKitOCR implements IOCRProvider {
  async recognizeText(imageUri: string): Promise<string> {
    try {
      logger.info(`ML Kit OCR starting for: ${imageUri}`);

      // The @dariyd/react-native-text-recognition API returns a complex object
      // with fullText, pages, and success status.
      const result = await recognizeText(imageUri, {
        recognitionLevel: 'block', // 'block' is better for capturing structure in photos
        languages: ['en']
      });

      if (result.success && result.fullText) {
        logger.info(`ML Kit OCR Success: Found ${result.fullText.length} characters.`);
        return result.fullText;
      }

      if (result.error) {
        logger.error(`ML Kit OCR Error: ${result.errorMessage}`);
      } else {
        logger.warn('ML Kit OCR returned no text result.');
      }

      return "";
    } catch (error) {
      logger.error('ML Kit OCR fatal exception', error);
      return "";
    }
  }
}
