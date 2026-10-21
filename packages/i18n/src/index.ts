import en from './en.json';
import fr from './fr.json';

export const messages = {
  en,
  fr
} as const;

export type SupportedLocale = 'en' | 'fr';

export function getDictionary(locale: string = 'en') {
  return locale.startsWith('fr') ? fr : en;
}
