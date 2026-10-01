import en from "../locales/en.json";
import de from "../locales/de.json";
import ja from "../locales/ja.json";
import { getLocale, type Locale } from "./locale";

export const englishMessages: Record<string, string> = en;
const catalogs: Record<Locale, Record<string, string>> = { en, de, ja };
type Values = Record<string, string | number>;

export function gettext(message: string, values: Values = {}): string {
  const catalog = catalogs[getLocale()];
  const translated = Object.hasOwn(catalog, message) ? catalog[message] : message;

  return translated.replace(/\{(\w+)\}/g, (token, key: string) => {
    return values[key] === undefined ? token : String(values[key]);
  });
}
