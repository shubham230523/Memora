export enum ErrorCode {
  UNKNOWN = 'UNKNOWN',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  AI_PROVIDER = 'AI_PROVIDER',
  PERMISSION = 'PERMISSION',
  SYNC = 'SYNC',
  INTERNAL = 'INTERNAL',
}

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly originalError?: unknown,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
