import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface BuilderState {
  goal: 'cv' | 'cover_letter' | 'both';
  sourceType: 'master_profile' | 'upload';
  file: File | null;
  jobDescription: string;
  targetLanguage: string;
  toneOfVoice: string;
}

interface BuilderStore {
  state: BuilderState;
  updateState: (updates: Partial<BuilderState>) => void;
  resetState: () => void;
}

const initialState: BuilderState = {
  goal: 'cv',
  sourceType: 'master_profile',
  file: null,
  jobDescription: '',
  targetLanguage: 'Vietnamese',
  toneOfVoice: 'Professional',
};

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set) => ({
      state: initialState,
      updateState: (updates) =>
        set((prev) => ({
          state: { ...prev.state, ...updates },
        })),
      resetState: () => set({ state: initialState }),
    }),
    {
      name: 'jobready-builder-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (store) => ({
        // We cannot serialize `File` objects, so we omit `file` from the persisted state
        state: {
          ...store.state,
          file: null, 
        }
      }),
    }
  )
);
