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
      setLanguage: (lang) => {
        // Sync to cookie so Server Components (getTranslations) read the same locale
        if (typeof document !== 'undefined') {
          document.cookie = `language=${lang};path=/;max-age=31536000`;
        }
        set({ language: lang });
      },
    }),
    {
      name: 'cv-generator-settings',
    }
  )
);

