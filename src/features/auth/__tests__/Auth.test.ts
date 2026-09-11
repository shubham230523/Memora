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
  });

  it('initializes with null user', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('restores session on initialize', async () => {
    const mockUser = { id: '1', email: 'test@test.com', createdAt: '', updatedAt: '' };
    (authService.getSession as jest.Mock).mockResolvedValue({ user: mockUser, token: 'abc' });

    await useAuthStore.getState().initialize();

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
