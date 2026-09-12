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
  loadModel: () => Promise<void>;
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
        if (currentState === 'READY' || currentState === 'LOADED' || currentState === 'LOADING') {
          // Try to load the model into memory
          await get().loadModel();
        } else {
          set({ state: 'NOT_INSTALLED' });
        }
      },

      loadModel: async () => {
        const { state } = get();
        if (state === 'LOADED' || state === 'LOADING') return;

        set({ state: 'LOADING' });
        try {
          // Placeholder path - in a real app, this would be a path in FileSystem.documentDirectory
          const modelPath = 'qwen-2.5-1.5b.gguf';
          await Platform.LocalAI.loadModel(modelPath);
          set({ state: 'LOADED' });
          logger.info('AI Model loaded into memory');
        } catch (err: any) {
          logger.error('Failed to load AI model', err);
          set({ state: 'FAILED', error: `Load failed: ${err.message}` });
        }
      },

      downloadModel: async () => {
        if (get().state === 'DOWNLOADING') return;

        set({ state: 'DOWNLOADING', progress: 0, error: null });

        try {
          logger.info('Starting model download...');

          // Simulate progress
          for (let i = 0; i <= 10; i++) {
            await new Promise(r => setTimeout(() => r(undefined), 300));
            set({ progress: i / 10 });
          }

          set({ state: 'READY', progress: 1 });
          logger.info('Model download complete');

          // Auto-load after download
          await get().loadModel();
        } catch (err: any) {
          set({ state: 'FAILED', error: err.message });
          logger.error('Model download failed', err);
        }
      },

      deleteModel: async () => {
        try {
          await Platform.LocalAI.unloadModel();
        } catch (e) {
          logger.error('Unload failed', e);
        }
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
