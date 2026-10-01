export type Locale = "en" | "de" | "ja";

const storageKey = "datalens-language";
const listeners = new Set<() => void>();

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "de" || value === "ja";
}

export function detectLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const base = language.toLowerCase().split(/[-_]/)[0];
    if (isLocale(base)) return base;
  }
  return "en";
}

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(storageKey);
    if (isLocale(saved)) return saved;
  } catch {
    // Browser preferences still work when storage is unavailable.
  }

  if (typeof navigator === "undefined") return "en";
  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  return detectLocale(languages);
}

let locale = initialLocale();

export function getLocale(): Locale {
  return locale;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function setLocale(next: Locale) {
  locale = next;
  try {
    localStorage.setItem(storageKey, next);
  } catch {
    // The selection remains active for this session.
  }
  listeners.forEach(listener => listener());
}
