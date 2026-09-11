import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { IFilePickerProvider, FilePickerResult } from '../interfaces/FilePicker';
import { logger } from '../../core/logging/Logger';

export class ExpoFilePicker implements IFilePickerProvider {
  async pickDocument(options?: { type?: string | string[] }): Promise<FilePickerResult | null> {
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
