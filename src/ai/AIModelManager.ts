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

const MODEL_URL = 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf';
const MODEL_FILENAME = 'qwen2.5-0.5b-q4_k_m.gguf';

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
        const modelUri = `${Platform.FileSystem.documentDirectory}${MODEL_FILENAME}`;
        const modelExists = await Platform.FileSystem.exists(modelUri);

        if (modelExists) {
          set({ state: 'READY' });
        } else {
          set({ state: 'NOT_INSTALLED' });
        }
      },

      loadModel: async () => {
        const { state } = get();
        if (state === 'LOADED' || state === 'LOADING') return;

        set({ state: 'LOADING' });
        try {
          const modelUri = `${Platform.FileSystem.documentDirectory}${MODEL_FILENAME}`;
          await Platform.LocalAI.loadModel(modelUri);
          set({ state: 'LOADED' });
          logger.info('AI Model loaded into memory');
        } catch (err: any) {
          logger.error('Failed to load AI model', err);
          set({ state: 'FAILED', error: `Load failed: ${err.message}` });
        }
      },

      downloadModel: async () => {
        if (get().state === 'DOWNLOADING') return;

        const modelUri = `${Platform.FileSystem.documentDirectory}${MODEL_FILENAME}`;

        set({ state: 'DOWNLOADING', progress: 0, error: null });

        try {
          logger.info('Starting real model download...');

          await Platform.FileSystem.downloadFile(
            MODEL_URL,
            modelUri,
            (progress) => {
              const p = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
              set({ progress: p });
            }
          );

          set({ state: 'READY', progress: 1 });
          logger.info('Model download complete');

          await get().loadModel();
        } catch (err: any) {
          set({ state: 'FAILED', error: `Download failed: ${err.message}` });
          logger.error('Model download failed', err);
        }
      },

      deleteModel: async () => {
        try {
          const modelUri = `${Platform.FileSystem.documentDirectory}${MODEL_FILENAME}`;
          await Platform.LocalAI.unloadModel();
          await Platform.FileSystem.deleteFile(modelUri);
        } catch (e) {
          logger.error('Delete/Unload failed', e);
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
