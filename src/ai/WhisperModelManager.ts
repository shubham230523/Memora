import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from '../platform/Platform';
import { logger } from '../core/logging/Logger';

export type WhisperState =
  | 'NOT_INSTALLED'
  | 'DOWNLOADING'
  | 'READY'
  | 'FAILED';

const WHISPER_MODEL_URL = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin';
const WHISPER_FILENAME = 'whisper-tiny-en.bin';

interface WhisperModelStore {
  state: WhisperState;
  progress: number;
  error: string | null;
  checkStatus: () => Promise<void>;
  downloadModel: () => Promise<void>;
  deleteModel: () => Promise<void>;
  getModelUri: () => string;
}

export const useWhisperModelStore = create<WhisperModelStore>()(
  persist(
    (set, get) => ({
      state: 'NOT_INSTALLED',
      progress: 0,
      error: null,

      getModelUri: () => `${Platform.FileSystem.documentDirectory}${WHISPER_FILENAME}`,

      checkStatus: async () => {
        const modelUri = get().getModelUri();
        const exists = await Platform.FileSystem.exists(modelUri);
        set({ state: exists ? 'READY' : 'NOT_INSTALLED' });
      },

      downloadModel: async () => {
        if (get().state === 'DOWNLOADING') return;

        const modelUri = get().getModelUri();
        set({ state: 'DOWNLOADING', progress: 0, error: null });

        try {
          logger.info('[Whisper] Starting model download...');
          await Platform.FileSystem.downloadFile(
            WHISPER_MODEL_URL,
            modelUri,
            (progress) => {
              const p = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
              set({ progress: p });
            }
          );
          set({ state: 'READY', progress: 1 });
          logger.info('[Whisper] Model download complete');
        } catch (err: any) {
          logger.error('[Whisper] Model download failed', err);
          set({ state: 'FAILED', error: err.message });
        }
      },

      deleteModel: async () => {
        try {
          await Platform.FileSystem.deleteFile(get().getModelUri());
          set({ state: 'NOT_INSTALLED', progress: 0 });
        } catch (e) {
          logger.error('[Whisper] Delete failed', e);
        }
      }
    }),
    {
      name: 'whisper-model-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => Platform.SecureStorage.getItem(name),
        setItem: (name, value) => Platform.SecureStorage.setItem(name, value),
        removeItem: (name) => Platform.SecureStorage.removeItem(name),
      })),
    }
  )
);
