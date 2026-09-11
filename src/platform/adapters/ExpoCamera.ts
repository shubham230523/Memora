import * as ImagePicker from 'expo-image-picker';
import { ICameraProvider, CameraCaptureResult } from '../interfaces/Camera';
import { logger } from '../../core/logging/Logger';

export class ExpoCamera implements ICameraProvider {
  async requestPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  async takePhoto(): Promise<CameraCaptureResult | null> {
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
