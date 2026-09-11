import { useAIModelStore } from '../../../src/ai/AIModelManager';
import { getAIProvider } from '../../../src/ai/AIProviderFactory';
import { useSettingsStore } from '../../../src/features/settings/SettingsStore';
import { Platform } from '../../../src/platform/Platform';

describe('Model Lifecycle, Provider Switching, and Local AI Integration', () => {
  beforeEach(() => {
    useAIModelStore.setState({ state: 'NOT_INSTALLED', progress: 0, error: null });
    useSettingsStore.setState({ inferenceMode: 'LOCAL' });
  });

  it('handles the complete model download lifecycle state transitions perfectly', async () => {
    const store = useAIModelStore.getState();
    expect(store.state).toBe('NOT_INSTALLED');

    // Trigger asynchronous model download simulation
    const downloadPromise = useAIModelStore.getState().downloadModel();
    expect(useAIModelStore.getState().state).toBe('DOWNLOADING');

    await downloadPromise;
    expect(useAIModelStore.getState().state).toBe('READY');
    expect(useAIModelStore.getState().progress).toBe(1);

    // Delete model
    await useAIModelStore.getState().deleteModel();
    expect(useAIModelStore.getState().state).toBe('NOT_INSTALLED');
  }, 15000);

  it('accurately resolves provider selection and switches between local and cloud backends', () => {
    // 1. Initially set to LOCAL inference mode
    useSettingsStore.setState({ inferenceMode: 'LOCAL' });
    let provider = getAIProvider();
    expect(provider.constructor.name).toBe('LocalAIProvider');

    // 2. Toggle to CLOUD inference mode
    useSettingsStore.setState({ inferenceMode: 'CLOUD' });
    provider = getAIProvider();
    expect(provider.constructor.name).toBe('OpenRouterAdapter');
  });

  it('throws an informative user error if local provider is chosen but model is not ready', async () => {
    useSettingsStore.setState({ inferenceMode: 'LOCAL' });
    (Platform.LocalAI as any).setModelReady(false); // Model is not ready/loaded

    const provider = getAIProvider();
    await expect(provider.generate({ prompt: 'Hello local AI' })).rejects.toThrow(
      'Local AI model not loaded. Please go to AI Setup.'
    );
  });

  it('executes successfully via the local provider when the model is loaded and ready', async () => {
    useSettingsStore.setState({ inferenceMode: 'LOCAL' });
    (Platform.LocalAI as any).setModelReady(true); // Simulate model is fully ready

    const provider = getAIProvider();
    const res = await provider.generate({ prompt: 'Hello local AI' });
    expect(res.text).toBeDefined();
  });
});
