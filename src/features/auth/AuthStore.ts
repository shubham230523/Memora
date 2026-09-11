import { create } from 'zustand';
import { User } from './models/User';
import { authService } from './AuthService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    set({ isLoading: true });
    const session = await authService.getSession();
    if (session) {
      set({ user: session.user, isAuthenticated: true });
    }
    set({ isLoading: false });
  },

  setSession: async (user, token) => {
    await authService.saveSession({ user, token });
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await authService.clearSession();
    set({ user: null, isAuthenticated: false });
  },
}));
