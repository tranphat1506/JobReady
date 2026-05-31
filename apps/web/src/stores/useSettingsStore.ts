import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'vi' | 'en';

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'vi',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'cv-generator-settings',
    }
  )
);
