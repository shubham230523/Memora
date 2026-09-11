import { useAuthStore } from '../AuthStore';
import { authService } from '../AuthService';

jest.mock('../AuthService', () => ({
  authService: {
    getSession: jest.fn(),
    saveSession: jest.fn(),
    clearSession: jest.fn(),
  },
}));

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it('initialize should load session if exists', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    (authService.getSession as jest.Mock).mockResolvedValue({ user: mockUser, token: 'abc' });

    await useAuthStore.getState().initialize();

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('initialize should set isLoading false if no session', async () => {
    (authService.getSession as jest.Mock).mockResolvedValue(null);

    await useAuthStore.getState().initialize();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('setSession should update state and service', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    await useAuthStore.getState().setSession(mockUser as any, 'token');

    expect(authService.saveSession).toHaveBeenCalledWith({ user: mockUser, token: 'token' });
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('logout should clear session and reset state', async () => {
    useAuthStore.setState({ user: { id: '1' } as any, isAuthenticated: true });

    await useAuthStore.getState().logout();

    expect(authService.clearSession).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
