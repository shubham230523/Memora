import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from '../../platform/Platform';

export type InferenceMode = 'LOCAL' | 'CLOUD';

interface SettingsState {
  inferenceMode: InferenceMode;
  setInferenceMode: (mode: InferenceMode) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      inferenceMode: 'LOCAL',
      setInferenceMode: (mode) => set({ inferenceMode: mode }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => Platform.SecureStorage.getItem(name),
        setItem: (name, value) => Platform.SecureStorage.setItem(name, value),
        removeItem: (name) => Platform.SecureStorage.removeItem(name),
      })),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
