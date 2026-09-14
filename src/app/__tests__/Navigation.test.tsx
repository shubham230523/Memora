import { render, screen, act } from '@/testing/test-utils';
import Index from '../index';
import { Redirect } from 'expo-router';
import { useAIModelStore } from '@/ai/AIModelManager';
import { useSettingsStore } from '@/features/settings/SettingsStore';

// Mock expo-router Redirect
jest.mock('expo-router', () => ({
  Redirect: jest.fn(() => null),
}));

describe('Root Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default stores to a clean state
    useAIModelStore.setState({ state: 'NOT_INSTALLED' });
    useSettingsStore.setState({ inferenceMode: 'LOCAL', _hasHydrated: true });
  });

  it('redirects to ai-model when local model not installed', async () => {
    await act(async () => {
      render(<Index />);
    });

    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: '/ai-model' }),
      undefined
    );
  });

  it('redirects to tabs when authenticated and model ready', async () => {
    // Mock checkStatus to not reset the state
    const originalCheckStatus = useAIModelStore.getState().checkStatus;
    useAIModelStore.getState().checkStatus = jest.fn().mockResolvedValue(undefined);

    useAIModelStore.setState({ state: 'READY' });

    await act(async () => {
      render(<Index />);
    });

    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: '/(tabs)' }),
      undefined
    );

    // Restore
    useAIModelStore.getState().checkStatus = originalCheckStatus;
  });

  it('renders loading view when settings not hydrated', async () => {
    useSettingsStore.setState({ _hasHydrated: false });

    const rendered = await render(<Index />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
