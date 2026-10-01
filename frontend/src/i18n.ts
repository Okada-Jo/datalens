import { useSyncExternalStore } from "react";
import { getLocale, subscribe, type Locale } from "./i18n/locale";
import { gettext } from "./i18n/translate";

// Stable public API: components can keep importing from "../i18n".
export { detectLocale, getLocale, setLocale, type Locale } from "./i18n/locale";
export { gettext } from "./i18n/translate";
export { translateMessage } from "./i18n/apiMessages";

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getLocale, () => "en");
}

function updateDocument() {
  if (typeof document === "undefined") return;
  document.documentElement.lang = getLocale();
  document.title = gettext("DataLens · A fresh perspective on your data");
}

subscribe(updateDocument);
updateDocument();
