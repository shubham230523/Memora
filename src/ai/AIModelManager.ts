import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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

export const useAIModelStore = create<AIModelStore>()(
  persist(
    (set, get) => ({
      state: 'NOT_INSTALLED',
      progress: 0,
      error: null,

      checkStatus: async () => {
        const currentState = get().state;
        // If it was already ready, keep it ready.
        // In a real app, you might check if the file still exists on disk here.
        if (currentState === 'READY' || currentState === 'LOADED') {
          set({ state: currentState });
        } else {
          set({ state: 'NOT_INSTALLED' });
        }
      },

      downloadModel: async () => {
        if (get().state === 'DOWNLOADING') return;

        set({ state: 'DOWNLOADING', progress: 0, error: null });

        try {
          logger.info('Starting model download...');

          // Simulate progress
          for (let i = 0; i <= 10; i++) {
            await new Promise(r => setTimeout(() => r(undefined), 500));
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
      }
    }),
    {
      name: 'ai-model-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => Platform.SecureStorage.getItem(name),
        setItem: (name, value) => Platform.SecureStorage.setItem(name, value),
        removeItem: (name) => Platform.SecureStorage.removeItem(name),
      })),
    }
  )
);
