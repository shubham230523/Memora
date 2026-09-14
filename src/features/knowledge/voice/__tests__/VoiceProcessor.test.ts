import { voiceProcessor } from '../VoiceProcessor';
import { Platform } from '../../../../platform/Platform';
import { geminiSTTAdapter } from '../../../../ai/adapters/GeminiSTTAdapter';
import { whisperSTTAdapter } from '../../../../ai/adapters/WhisperSTTAdapter';
import { useSettingsStore } from '../../../settings/SettingsStore';

jest.mock('../../../../platform/Platform', () => ({
  Platform: {
    Microphone: {
      requestPermissions: jest.fn(),
      startRecording: jest.fn(),
      stopRecording: jest.fn().mockResolvedValue('file:///voice.m4a'),
    },
    FileSystem: {
      readAsBase64: jest.fn(),
      exists: jest.fn().mockResolvedValue(true),
    },
    SecureStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    }
  },
}));

jest.mock('../../../../ai/adapters/GeminiSTTAdapter', () => ({
  geminiSTTAdapter: {
    transcribe: jest.fn(),
  },
}));

jest.mock('../../../../ai/adapters/WhisperSTTAdapter', () => ({
  whisperSTTAdapter: {
    transcribe: jest.fn(),
  },
}));

describe('VoiceProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.setState({ inferenceMode: 'CLOUD' });
  });

  it('transcribe should read file and call Gemini in CLOUD mode', async () => {
    (Platform.FileSystem.readAsBase64 as jest.Mock).mockResolvedValue('base64data');
    (geminiSTTAdapter.transcribe as jest.Mock).mockResolvedValue('Transcribed Text');

    const result = await voiceProcessor.transcribe('file:///test.m4a');

    expect(result).toBe('Transcribed Text');
    expect(Platform.FileSystem.readAsBase64).toHaveBeenCalledWith('file:///test.m4a');
    expect(geminiSTTAdapter.transcribe).toHaveBeenCalledWith('base64data', 'audio/m4a');
  });

  it('transcribe should call Whisper in LOCAL mode', async () => {
    useSettingsStore.setState({ inferenceMode: 'LOCAL' });
    (whisperSTTAdapter.transcribe as jest.Mock).mockResolvedValue('Local Transcription');

    const result = await voiceProcessor.transcribe('file:///test.m4a');

    expect(result).toBe('Local Transcription');
    expect(whisperSTTAdapter.transcribe).toHaveBeenCalledWith('file:///test.m4a');
  });

  it('transcribe should handle empty result from Gemini', async () => {
    useSettingsStore.setState({ inferenceMode: 'CLOUD' });
    (Platform.FileSystem.readAsBase64 as jest.Mock).mockResolvedValue('base64data');
    (geminiSTTAdapter.transcribe as jest.Mock).mockResolvedValue('');

    const result = await voiceProcessor.transcribe('file:///test.m4a');

    expect(result).toBe('No speech detected in this recording.');
  });

  it('startRecording should request permissions and start recording', async () => {
    (Platform.Microphone.requestPermissions as jest.Mock).mockResolvedValue(true);

    await voiceProcessor.startRecording();

    expect(Platform.Microphone.requestPermissions).toHaveBeenCalled();
    expect(Platform.Microphone.startRecording).toHaveBeenCalled();
  });

  it('startRecording should throw if permission denied', async () => {
    (Platform.Microphone.requestPermissions as jest.Mock).mockResolvedValue(false);

    await expect(voiceProcessor.startRecording()).rejects.toThrow('Microphone permission denied');
  });

  it('stopRecording should return uri from platform', async () => {
    (Platform.Microphone.stopRecording as jest.Mock).mockResolvedValue('file:///recorded.wav');

    const uri = await voiceProcessor.stopRecording();

    expect(uri).toBe('file:///recorded.wav');
    expect(Platform.Microphone.stopRecording).toHaveBeenCalled();
  });
});
