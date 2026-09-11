import { IOCRProvider } from '../interfaces/OCR';

export class PlaceholderOCR implements IOCRProvider {
  async recognizeText(imageUri: string): Promise<string> {
    // Placeholder implementation
    return "This is a placeholder OCR result for " + imageUri;
  }
}
