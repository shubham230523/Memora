import { env } from './env';

export const appConfig = {
  name: 'Recall',
  version: '1.0.0',
  api: {
    baseUrl: env.BACKEND_URL,
    timeout: 30000,
  },
  ai: {
    openRouter: {
      apiKey: env.OPENROUTER_API_KEY,
    },
    gemini: {
      apiKey: env.GEMINI_API_KEY,
    },
    ollama: {
      baseUrl: env.OLLAMA_BASE_URL,
    },
  },
  logging: {
    level: env.LOG_LEVEL,
  },
  persistence: {
    dbName: 'recall.db',
  },
} as const;
