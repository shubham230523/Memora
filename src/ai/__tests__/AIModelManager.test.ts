import { useAIModelStore } from '../AIModelManager';
import { Platform } from '../../platform/Platform';

describe('AIModelManager', () => {
  beforeEach(() => {
    useAIModelStore.setState({
      state: 'NOT_INSTALLED',
      progress: 0,
      error: null,
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with NOT_INSTALLED state', () => {
    const state = useAIModelStore.getState();
    expect(state.state).toBe('NOT_INSTALLED');
    expect(state.progress).toBe(0);
    expect(state.error).toBeNull();
  });

  it('checkStatus should set state to NOT_INSTALLED', async () => {
    useAIModelStore.setState({ state: 'READY' });
    await useAIModelStore.getState().checkStatus();
    expect(useAIModelStore.getState().state).toBe('NOT_INSTALLED');
  });

  it('loadModel should set LOADED state', async () => {
    useAIModelStore.setState({ state: 'READY' });
    await useAIModelStore.getState().loadModel();
    expect(useAIModelStore.getState().state).toBe('LOADED');
  });

  it('loadModel should handle errors', async () => {
    useAIModelStore.setState({ state: 'READY' });
    const originalLoadModel = Platform.LocalAI.loadModel;
    Platform.LocalAI.loadModel = jest.fn().mockRejectedValue(new Error('Mem limit'));

    await useAIModelStore.getState().loadModel();

    expect(useAIModelStore.getState().state).toBe('FAILED');
    expect(useAIModelStore.getState().error).toContain('Mem limit');

    Platform.LocalAI.loadModel = originalLoadModel;
  });

  it('waitForModelReady should resolve if LOADED', async () => {
    useAIModelStore.setState({ state: 'LOADED' });
    await expect(useAIModelStore.getState().waitForModelReady()).resolves.toBeUndefined();
  });

  it('waitForModelReady should throw if state is FAILED', async () => {
    useAIModelStore.setState({ state: 'FAILED' });
    await expect(useAIModelStore.getState().waitForModelReady()).rejects.toThrow('AI Model is not available');
  });

  it('waitForModelReady should trigger load if READY', async () => {
    useAIModelStore.setState({ state: 'READY' });
    const originalLoad = useAIModelStore.getState().loadModel;
    const mockLoad = jest.fn().mockResolvedValue(undefined);
    useAIModelStore.getState().loadModel = mockLoad;

    // Use a small delay to let microtasks run
    const promise = useAIModelStore.getState().waitForModelReady();

    // Fast-forward time for the loop
    await Promise.resolve();
    jest.advanceTimersByTime(1000);
    await Promise.resolve();

    expect(mockLoad).toHaveBeenCalled();
    useAIModelStore.getState().loadModel = originalLoad;
  });

  it('downloadModel should handle early exit if already downloading', async () => {
    useAIModelStore.setState({ state: 'DOWNLOADING' });
    await useAIModelStore.getState().downloadModel();
    expect(useAIModelStore.getState().state).toBe('DOWNLOADING');
  });

  it('downloadModel should simulate progress and finish', async () => {
    const downloadPromise = useAIModelStore.getState().downloadModel();

    expect(useAIModelStore.getState().state).toBe('DOWNLOADING');

    // Advance timers to complete loop
    for (let i = 0; i < 11; i++) {
      jest.advanceTimersByTime(500);
      // We need to yield to the event loop for promises to resolve
      await Promise.resolve();
    }

    await downloadPromise;

    expect(useAIModelStore.getState().state).toBe('LOADED');
    expect(useAIModelStore.getState().progress).toBe(1);
  });

  it('downloadModel should not start if already downloading', async () => {
    useAIModelStore.setState({ state: 'DOWNLOADING' });
    await useAIModelStore.getState().downloadModel();
    // It should return early without changing progress (which is 0 by default in this test)
    expect(useAIModelStore.getState().progress).toBe(0);
  });

  it('deleteModel should reset state', async () => {
    useAIModelStore.setState({ state: 'READY', progress: 1 });
    await useAIModelStore.getState().deleteModel();
    expect(useAIModelStore.getState().state).toBe('NOT_INSTALLED');
    expect(useAIModelStore.getState().progress).toBe(0);
  });
});
