import { voiceProcessor } from '../VoiceProcessor';
import { Platform } from '../../../../platform/Platform';

jest.mock('../../../../platform/Platform', () => ({
  Platform: {
    Microphone: {
      requestPermissions: jest.fn(),
      startRecording: jest.fn(),
      stopRecording: jest.fn().mockResolvedValue('file:///voice.m4a'),
    },
  },
}));

describe('VoiceProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('startRecording should call platform methods', async () => {
    (Platform.Microphone.requestPermissions as jest.Mock).mockResolvedValue(true);
    await voiceProcessor.startRecording();
    expect(Platform.Microphone.startRecording).toHaveBeenCalled();
  });

  it('startRecording should throw if permission denied', async () => {
    (Platform.Microphone.requestPermissions as jest.Mock).mockResolvedValue(false);
    await expect(voiceProcessor.startRecording()).rejects.toThrow('Microphone permission denied');
  });

  it('stopRecording should return uri', async () => {
    (Platform.Microphone.stopRecording as jest.Mock).mockResolvedValue('file://audio.m4a');
    const result = await voiceProcessor.stopRecording();
    expect(result).toBe('file://audio.m4a');
  });

  it('transcribe should return placeholder text', async () => {
    const result = await voiceProcessor.transcribe('uri');
    expect(result).toContain('transcription');
  });

  it('transcribe should handle null or undefined uri', async () => {
    const result = await voiceProcessor.transcribe('');
    expect(result).toContain('transcription');
  });
});
