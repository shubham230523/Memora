import { create } from 'zustand';
import { Platform } from '../platform/Platform';
import { logger } from '../core/logging/Logger';

export type ModelState =
  | 'NOT_INSTALLED'
  | 'DOWNLOADING'
  | 'VERIFYING'
  | 'READY'
  | 'LOADING'
  | 'LOADED'
  | 'FAILED';

interface AIModelStore {
  state: ModelState;
  progress: number; // 0 to 1
  error: string | null;
  checkStatus: () => Promise<void>;
  downloadModel: () => Promise<void>;
  deleteModel: () => Promise<void>;
}

const MODEL_FILENAME = 'qwen2.5-1.5b-instruct-q4_k_m.gguf';
const MODEL_URL = 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf';

export const useAIModelStore = create<AIModelStore>((set, get) => ({
  state: 'NOT_INSTALLED',
  progress: 0,
  error: null,

  checkStatus: async () => {
    // TODO: Use Platform.FileSystem to check if file exists
    // For now, assume NOT_INSTALLED
    set({ state: 'NOT_INSTALLED' });
  },

  downloadModel: async () => {
    if (get().state === 'DOWNLOADING') return;

    set({ state: 'DOWNLOADING', progress: 0, error: null });

    try {
      logger.info('Starting model download...');
      // In a real implementation, we would use expo-file-system
      // with a download progress callback.

      // Simulate progress
      for (let i = 0; i <= 10; i++) {
        await new Promise(r => setTimeout(resolve => r(resolve), 500));
        set({ progress: i / 10 });
      }

      set({ state: 'READY', progress: 1 });
      logger.info('Model download complete');
    } catch (err: any) {
      set({ state: 'FAILED', error: err.message });
      logger.error('Model download failed', err);
    }
  },

  deleteModel: async () => {
    set({ state: 'NOT_INSTALLED', progress: 0 });
    // TODO: Delete file via Platform.FileSystem
  }
}));
