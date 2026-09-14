import { ExpoMicrophone } from '../ExpoMicrophone';
import { Audio } from 'expo-audio';
import { logger } from '../../../core/logging/Logger';

jest.mock('expo-audio', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(),
    getPermissionsAsync: jest.fn(),
    setAudioModeAsync: jest.fn(),
    Recording: {
      createAsync: jest.fn(),
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
  },
}));

jest.mock('../../../core/logging/Logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ExpoMicrophone', () => {
  let microphone: ExpoMicrophone;

  beforeEach(() => {
    microphone = new ExpoMicrophone();
    jest.clearAllMocks();
  });

  it('requestPermissions should return true if granted', async () => {
    (Audio.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
    (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted', granted: true });
    const granted = await microphone.requestPermissions();
    expect(granted).toBe(true);
  });

  it('startRecording should create recording', async () => {
    const mockRecording = { stopAndUnloadAsync: jest.fn(), getURI: jest.fn() };
    (Audio.Recording.createAsync as jest.Mock).mockResolvedValue({ recording: mockRecording });

    await microphone.startRecording();

    expect(Audio.setAudioModeAsync).toHaveBeenCalled();
    expect(Audio.Recording.createAsync).toHaveBeenCalled();
  });

  it('stopRecording should stop and return URI', async () => {
    const mockRecording = {
      stopAndUnloadAsync: jest.fn().mockResolvedValue({}),
      getURI: jest.fn().mockReturnValue('uri')
    };
    (Audio.Recording.createAsync as jest.Mock).mockResolvedValue({ recording: mockRecording });

    await microphone.startRecording();
    const uri = await microphone.stopRecording();

    expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
    expect(uri).toBe('uri');
  });

  it('stopRecording should return null if no recording active', async () => {
    const uri = await microphone.stopRecording();
    expect(uri).toBeNull();
  });

  it('pauseRecording and resumeRecording should call appropriate methods', async () => {
    const mockRecording = { pauseAsync: jest.fn(), startAsync: jest.fn() };
    (Audio.Recording.createAsync as jest.Mock).mockResolvedValue({ recording: mockRecording });

    await microphone.startRecording();
    await microphone.pauseRecording();
    expect(mockRecording.pauseAsync).toHaveBeenCalled();

    await microphone.resumeRecording();
    expect(mockRecording.startAsync).toHaveBeenCalled();
  });
});
