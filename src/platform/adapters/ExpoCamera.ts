import { ICameraProvider, CameraCaptureResult } from '../interfaces/Camera';
import { logger } from '../../core/logging/Logger';

let ImagePicker: typeof import('expo-image-picker') | null = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {
  logger.warn('expo-image-picker not found. Camera features will be disabled.');
}

export class ExpoCamera implements ICameraProvider {
  async requestPermissions(): Promise<boolean> {
    if (!ImagePicker) {
      logger.error('ImagePicker module is missing');
      return false;
    }

    try {
      // Check current status first
      const current = await ImagePicker.getCameraPermissionsAsync();
      if (current.granted) return true;

      // If not granted, request it
      const { status, granted } = await ImagePicker.requestCameraPermissionsAsync();
      return granted || status === 'granted';
    } catch (error) {
      logger.error('Failed to request camera permissions', error);
      return false;
    }
  }

  async takePhoto(): Promise<CameraCaptureResult | null> {
    if (!ImagePicker) {
      logger.error('ImagePicker module is missing');
      return null;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      };
    } catch (error) {
      logger.error('Failed to take photo', error);
      return null;
    }
  }
}
