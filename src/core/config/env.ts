import { z } from 'zod';

const envSchema = z.object({
  // AI API Keys
  OPENROUTER_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),

  // Backend
  BACKEND_URL: z.string().url().default('http://localhost:8080'),

  // App Settings
  APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

// In Expo v57, process.env is populated from .env files
export const env = envSchema.parse({
  OPENROUTER_API_KEY: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  OLLAMA_BASE_URL: process.env.EXPO_PUBLIC_OLLAMA_BASE_URL,
  BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
  APP_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.EXPO_PUBLIC_LOG_LEVEL,
});
