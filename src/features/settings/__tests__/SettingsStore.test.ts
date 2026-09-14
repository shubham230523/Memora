import { useSettingsStore } from '../SettingsStore';

describe('SettingsStore', () => {
  it('should initialize with default values', () => {
    const state = useSettingsStore.getState();
    expect(state.inferenceMode).toBe('LOCAL');
  });

  it('setInferenceMode should update state', () => {
    useSettingsStore.getState().setInferenceMode('CLOUD');
    expect(useSettingsStore.getState().inferenceMode).toBe('CLOUD');
  });

  it('setHasHydrated should update state', () => {
    useSettingsStore.getState().setHasHydrated(true);
    expect(useSettingsStore.getState()._hasHydrated).toBe(true);
  });
});
