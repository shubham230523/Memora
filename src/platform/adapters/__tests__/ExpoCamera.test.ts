import { ExpoCamera } from '../ExpoCamera';
import * as ImagePicker from 'expo-image-picker';
import { logger } from '../../../core/logging/Logger';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  getCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

jest.mock('../../../core/logging/Logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ExpoCamera', () => {
  let camera: ExpoCamera;

  beforeEach(() => {
    camera = new ExpoCamera();
    jest.clearAllMocks();
  });

  describe('requestPermissions', () => {
    it('should return true if status is granted', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted', granted: true });
      const granted = await camera.requestPermissions();
      expect(granted).toBe(true);
    });

    it('should return false if status is not granted', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied', granted: false });
      const granted = await camera.requestPermissions();
      expect(granted).toBe(false);
    });
  });

  describe('takePhoto', () => {
    it('should return asset info on success', async () => {
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'photo-uri', width: 100, height: 100 }]
      });

      const result = await camera.takePhoto();
      expect(result).toEqual({ uri: 'photo-uri', width: 100, height: 100 });
    });

    it('should return null if canceled', async () => {
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: true
      });

      const result = await camera.takePhoto();
      expect(result).toBeNull();
    });

    it('should return null and log error on failure', async () => {
      (ImagePicker.launchCameraAsync as jest.Mock).mockRejectedValue(new Error('fail'));

      const result = await camera.takePhoto();
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
