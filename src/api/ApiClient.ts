import { appConfig } from '../core/config/appConfig';
import { AppError, ErrorCode } from '../core/errors/AppError';
import { logger } from '../core/logging/Logger';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = appConfig.api.baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AppError(
          ErrorCode.NETWORK,
          errorData.message || `Request failed with status ${response.status}`,
          null,
          { status: response.status }
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AppError) throw error;

      logger.error(`API Request failed: ${url}`, error);
      throw new AppError(
        ErrorCode.NETWORK,
        'Network request failed',
        error
      );
    }
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient();
