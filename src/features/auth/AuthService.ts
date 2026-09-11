import { Platform } from '../../platform/Platform';
import { User } from './models/User';

export interface AuthSession {
  user: User;
  token: string;
}

export class AuthService {
  private static TOKEN_KEY = 'auth_token';
  private static USER_KEY = 'auth_user';

  async getSession(): Promise<AuthSession | null> {
    const token = await Platform.SecureStorage.getItem(AuthService.TOKEN_KEY);
    const userJson = await Platform.SecureStorage.getItem(AuthService.USER_KEY);

    if (token && userJson) {
      try {
        return {
          token,
          user: JSON.parse(userJson),
        };
      } catch {
        return null;
      }
    }
    return null;
  }

  async saveSession(session: AuthSession): Promise<void> {
    await Platform.SecureStorage.setItem(AuthService.TOKEN_KEY, session.token);
    await Platform.SecureStorage.setItem(AuthService.USER_KEY, JSON.stringify(session.user));
  }

  async clearSession(): Promise<void> {
    await Platform.SecureStorage.removeItem(AuthService.TOKEN_KEY);
    await Platform.SecureStorage.removeItem(AuthService.USER_KEY);
  }
}

export const authService = new AuthService();
