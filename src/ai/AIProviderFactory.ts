import { IAIProvider } from './interfaces/AIProvider';
import { OpenRouterAdapter } from './adapters/OpenRouterAdapter';
import { useSettingsStore } from '../features/settings/SettingsStore';

// We will implement LocalAIProvider later during the spike
// For now, it will throw if selected
export class PlaceholderLocalAIProvider implements IAIProvider {
  async generate() {
    throw new Error('Local AI not yet implemented. Please download the model first.');
    return { text: '' };
  }
  async streamGenerate() {
    throw new Error('Local AI not yet implemented.');
  }
}

const cloudProvider = new OpenRouterAdapter();
const localProvider = new PlaceholderLocalAIProvider();

export const getAIProvider = (): IAIProvider => {
  const { inferenceMode } = useSettingsStore.getState();
  return inferenceMode === 'CLOUD' ? cloudProvider : localProvider;
};
