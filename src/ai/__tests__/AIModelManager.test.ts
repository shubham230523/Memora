import { useAIModelStore } from '../AIModelManager';

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

    expect(useAIModelStore.getState().state).toBe('READY');
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
