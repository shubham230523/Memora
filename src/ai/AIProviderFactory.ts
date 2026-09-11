import { IAIProvider } from './interfaces/AIProvider';
import { OpenRouterAdapter } from './adapters/OpenRouterAdapter';
import { LocalAIProvider } from './adapters/LocalAIProvider';
import { useSettingsStore } from '../features/settings/SettingsStore';

const cloudProvider = new OpenRouterAdapter();
const localProvider = new LocalAIProvider();

export const getAIProvider = (): IAIProvider => {
  const { inferenceMode } = useSettingsStore.getState();
  return inferenceMode === 'CLOUD' ? cloudProvider : localProvider;
};
