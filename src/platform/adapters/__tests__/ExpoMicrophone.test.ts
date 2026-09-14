import { ExpoMicrophone } from '../ExpoMicrophone';
import * as Audio from 'expo-audio';
import { logger } from '../../../core/logging/Logger';

jest.mock('expo-audio', () => ({
  getRecordingPermissionsAsync: jest.fn(),
  requestRecordingPermissionsAsync: jest.fn(),
  setAudioModeAsync: jest.fn(),
  AudioModule: {
    AudioRecorder: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: jest.fn(),
      record: jest.fn(),
      stop: jest.fn(),
      release: jest.fn(),
      pause: jest.fn(),
      uri: 'uri'
    })),
  },
  RecordingPresets: {
    HIGH_QUALITY: {},
  },
}));

jest.mock('../../../core/logging/Logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('ExpoMicrophone', () => {
  let microphone: ExpoMicrophone;

  beforeEach(() => {
    microphone = new ExpoMicrophone();
    jest.clearAllMocks();
  });

  it('requestPermissions should return true if granted', async () => {
    (Audio.getRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
    (Audio.requestRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted', granted: true });
    const granted = await microphone.requestPermissions();
    expect(granted).toBe(true);
  });

  it('startRecording should create recorder and start', async () => {
    await microphone.startRecording();
    expect(Audio.setAudioModeAsync).toHaveBeenCalled();
    expect(Audio.AudioModule.AudioRecorder).toHaveBeenCalled();
  });

  it('stopRecording should stop and return URI', async () => {
    await microphone.startRecording();
    const uri = await microphone.stopRecording();
    expect(uri).toBe('uri');
  });

  it('stopRecording should return null if no recording active', async () => {
    const uri = await microphone.stopRecording();
    expect(uri).toBeNull();
  });
});
