import { ExpoFilePicker } from './adapters/ExpoFilePicker';
import { ExpoCamera } from './adapters/ExpoCamera';
import { ExpoMicrophone } from './adapters/ExpoMicrophone';
import { ExpoSecureStorage } from './adapters/ExpoSecureStorage';
import { ExpoNotifications } from './adapters/ExpoNotifications';
import { MLKitOCR } from './adapters/MLKitOCR';
import { LlamaLocalAI } from './adapters/LlamaLocalAI';
import { ExpoFileSystem } from './adapters/ExpoFileSystem';

export const Platform = {
  FilePicker: new ExpoFilePicker(),
  Camera: new ExpoCamera(),
  Microphone: new ExpoMicrophone(),
  SecureStorage: new ExpoSecureStorage(),
  Notifications: new ExpoNotifications(),
  OCR: new MLKitOCR(),
  LocalAI: new LlamaLocalAI(),
  FileSystem: new ExpoFileSystem(),
};
