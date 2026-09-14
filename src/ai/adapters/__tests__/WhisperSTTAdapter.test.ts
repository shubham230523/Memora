import { WhisperSTTAdapter } from '../WhisperSTTAdapter';
import { useWhisperModelStore } from '../../WhisperModelManager';
import { initWhisper } from 'whisper.rn';

jest.mock('../../../core/logging/Logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('WhisperSTTAdapter', () => {
  let adapter: WhisperSTTAdapter;

  beforeEach(() => {
    adapter = new WhisperSTTAdapter();
    jest.clearAllMocks();
  });

  it('should throw error if model not ready', async () => {
    useWhisperModelStore.setState({ state: 'NOT_INSTALLED' });
    await expect(adapter.transcribe('file://test.m4a')).rejects.toThrow('Whisper model is not downloaded');
  });

  it('should initialize and transcribe if model is ready', async () => {
    useWhisperModelStore.setState({ state: 'READY' });
    const result = await adapter.transcribe('file://test.m4a');

    expect(result).toBe('Mock transcription');
    expect(initWhisper).toHaveBeenCalled();
  });

  it('should release context', async () => {
    useWhisperModelStore.setState({ state: 'READY' });
    await adapter.transcribe('file://test.m4a');
    await adapter.release();
    // @ts-ignore
    expect(adapter.context).toBeNull();
  });
});
