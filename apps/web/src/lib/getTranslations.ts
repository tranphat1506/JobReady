import { cookies } from 'next/headers';
import vi from '@/locales/vi.json';
import en from '@/locales/en.json';

const dictionaries = { vi, en };

type Lang = 'vi' | 'en';

export async function getTranslations() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('language')?.value as Lang) ?? 'vi';
  const dict = dictionaries[lang] ?? vi;

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = dict;
    for (const key of keys) {
      if (current?.[key] === undefined) return path;
      current = current[key];
    }
    return typeof current === 'string' ? current : path;
  };

  return { t, lang };
}
