import { Languages } from "lucide-react";
import { gettext as t, setLocale, useLocale, type Locale } from "../i18n";

export function LanguageSelect() {
  const locale = useLocale();
  return <label className="flex items-center gap-2 rounded-full border border-zinc-200 bg-surface px-3 py-2 text-sm text-zinc-700">
    <Languages size={16} aria-hidden="true" />
    <span className="sr-only">{t("Language")}</span>
    <select aria-label={t("Language")} value={locale} onChange={event => setLocale(event.target.value as Locale)} className="min-w-0 cursor-pointer bg-surface outline-none">
      <option value="en" lang="en">English</option>
      <option value="de" lang="de">Deutsch</option>
      <option value="ja" lang="ja">日本語</option>
    </select>
  </label>;
}
