import { useWhisperModelStore } from '../WhisperModelManager';
import { Platform } from '../../platform/Platform';

jest.mock('../../platform/Platform', () => ({
  Platform: {
    FileSystem: {
      documentDirectory: 'file:///mock/',
      exists: jest.fn(),
      downloadFile: jest.fn(),
      deleteFile: jest.fn(),
    },
    SecureStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    }
  },
}));

describe('WhisperModelManager', () => {
  beforeEach(() => {
    useWhisperModelStore.setState({
      state: 'NOT_INSTALLED',
      progress: 0,
      error: null,
    });
  });

  it('should initialize with NOT_INSTALLED', () => {
    expect(useWhisperModelStore.getState().state).toBe('NOT_INSTALLED');
  });

  it('checkStatus should update state if file exists', async () => {
    (Platform.FileSystem.exists as jest.Mock).mockResolvedValue(true);
    await useWhisperModelStore.getState().checkStatus();
    expect(useWhisperModelStore.getState().state).toBe('READY');
  });

  it('downloadModel should handle success', async () => {
    (Platform.FileSystem.downloadFile as jest.Mock).mockImplementation((url, uri, cb) => {
      cb({ totalBytesWritten: 100, totalBytesExpectedToWrite: 100 });
      return Promise.resolve(uri);
    });

    await useWhisperModelStore.getState().downloadModel();

    expect(useWhisperModelStore.getState().state).toBe('READY');
    expect(useWhisperModelStore.getState().progress).toBe(1);
  });

  it('downloadModel should handle failure', async () => {
    (Platform.FileSystem.downloadFile as jest.Mock).mockRejectedValue(new Error('Network error'));

    await useWhisperModelStore.getState().downloadModel();

    expect(useWhisperModelStore.getState().state).toBe('FAILED');
    expect(useWhisperModelStore.getState().error).toBe('Network error');
  });

  it('deleteModel should reset state', async () => {
    useWhisperModelStore.setState({ state: 'READY' });
    await useWhisperModelStore.getState().deleteModel();
    expect(useWhisperModelStore.getState().state).toBe('NOT_INSTALLED');
  });
});
