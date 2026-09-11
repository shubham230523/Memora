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

  private sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) return data;

    // Simple secret scrubbing
    const secretKeys = ['key', 'secret', 'token', 'password', 'auth'];
    const sanitized = { ...data };

    Object.keys(sanitized).forEach(key => {
      if (secretKeys.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    });

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
