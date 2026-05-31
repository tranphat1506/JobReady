import { useSettingsStore } from '@/stores/useSettingsStore';
import vi from '@/locales/vi.json';
import en from '@/locales/en.json';

const dictionaries = {
  vi,
  en,
};

type Dictionary = typeof vi;

export function useTranslation() {
  const language = useSettingsStore((state) => state.language);
  const dict = dictionaries[language];

  // Helper to get nested values like 'landing.hero.title1'
  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = dict;
    
    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation missing for key: ${path} in ${language}`);
        return path;
      }
      current = current[key];
    }
    
    return current;
  };

  return { t, language };
}
