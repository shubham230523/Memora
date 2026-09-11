import { IFilePickerProvider, FilePickerResult } from '../interfaces/FilePicker';
import { logger } from '../../core/logging/Logger';

let DocumentPicker: typeof import('expo-document-picker') | null = null;
try {
  DocumentPicker = require('expo-document-picker');
} catch (e) {
  logger.warn('expo-document-picker not found. Document picking will be disabled.');
}

let ImagePicker: typeof import('expo-image-picker') | null = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {
  logger.warn('expo-image-picker not found. Image picking will be disabled.');
}

export class ExpoFilePicker implements IFilePickerProvider {
  async pickDocument(options?: { type?: string | string[] }): Promise<FilePickerResult | null> {
    if (!DocumentPicker) {
      logger.error('DocumentPicker module is missing');
      return null;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: options?.type || '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
        size: asset.size,
      };
    } catch (error) {
      logger.error('Failed to pick document', error);
      return null;
    }
  }

  async pickImage(): Promise<FilePickerResult | null> {
    if (!ImagePicker) {
      logger.error('ImagePicker module is missing');
      return null;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        name: asset.fileName || 'image.jpg',
        mimeType: asset.mimeType,
        size: asset.fileSize,
      };
    } catch (error) {
      logger.error('Failed to pick image', error);
      return null;
    }
  }
}
