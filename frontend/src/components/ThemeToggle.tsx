import { gettext as t, useLocale } from "../i18n";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Theme = "light" | "system" | "dark";

export function ThemeToggle() {
  useLocale();
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem("datalens-theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch { /* Storage can be unavailable in private browsers. */ }
    return "system";
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = theme === "system"
        ? (media.matches ? "dark" : "light") : theme;
    };
    apply();
    try { localStorage.setItem("datalens-theme", theme); } catch { /* Keep the session preference. */ }
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  return (
    <div className="theme-toggle" role="group" aria-label={t("Color theme")}>
      {([{ value: "light", Icon: Sun }, { value: "system", Icon: Monitor }, { value: "dark", Icon: Moon }] as const).map(({ value, Icon }) => (
        <button key={value} type="button" title={t({ light: "Light theme", system: "System theme", dark: "Dark theme" }[value])}
          aria-label={t({ light: "Light theme", system: "System theme", dark: "Dark theme" }[value])} aria-pressed={theme === value}
          onClick={() => setTheme(value)}>
          <Icon size={16} /><span className="sr-only">{t({ light: "Light theme", system: "System theme", dark: "Dark theme" }[value])}</span>
        </button>
      ))}
    </div>
  );
}
