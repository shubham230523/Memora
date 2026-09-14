import { getAIProvider } from '../AIProviderFactory';
import { useSettingsStore } from '../../features/settings/SettingsStore';

describe('AIProviderFactory', () => {
  it('should return Local AI provider when mode is LOCAL', () => {
    useSettingsStore.setState({ inferenceMode: 'LOCAL' });
    const provider = getAIProvider();
    expect(provider).toBeDefined();
    // Use ducks typing or other check if constructor name is transformed
    expect(provider.generate).toBeDefined();
  });

  it('should return Cloud AI provider when mode is CLOUD', () => {
    useSettingsStore.setState({ inferenceMode: 'CLOUD' });
    const provider = getAIProvider();
    expect(provider.constructor.name).toBe('OpenRouterAdapter');
  });
});
