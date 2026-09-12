import { appConfig } from '../config/appConfig';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private level: number;

  constructor() {
    this.level = LOG_LEVELS[appConfig.logging.level];
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (LOG_LEVELS[level] >= this.level) {
      const timestamp = new Date().toISOString();
      const sanitizedArgs = args.map(arg => this.sanitize(arg));
      console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...sanitizedArgs);
    }
  }

  private sanitize(data: any, depth = 0): any {
    if (depth > 3) return '[DEPTH_LIMIT]';

    if (data instanceof Error) {
      return {
        name: data.name,
        message: data.message,
        stack: data.stack,
      };
    }

    if (typeof data !== 'object' || data === null) return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.slice(0, 5).map(item => this.sanitize(item, depth + 1));
    }

    // Simple secret scrubbing
    const secretKeys = ['key', 'secret', 'token', 'password', 'auth'];
    const sanitized: any = {};

    try {
      Object.keys(data).forEach(key => {
        if (secretKeys.some(s => key.toLowerCase().includes(s))) {
          sanitized[key] = '[REDACTED]';
        } else {
          const value = data[key];
          if (typeof value === 'object' && value !== null) {
            sanitized[key] = this.sanitize(value, depth + 1);
          } else {
            sanitized[key] = value;
          }
        }
      });
    } catch (e) {
      return '[UNSERIALIZABLE]';
    }

    return sanitized;
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }
}

export const logger = new Logger();
