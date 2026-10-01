import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Theme = "light" | "system" | "dark";

export function ThemeToggle() {
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
    <div className="theme-toggle" role="group" aria-label="Color theme">
      {([{ value: "light", Icon: Sun }, { value: "system", Icon: Monitor }, { value: "dark", Icon: Moon }] as const).map(({ value, Icon }) => (
        <button key={value} type="button" title={`${value[0].toUpperCase()}${value.slice(1)} theme`}
          aria-label={`${value} theme`} aria-pressed={theme === value}
          onClick={() => setTheme(value)}>
          <Icon size={16} /><span className="sr-only">{value}</span>
        </button>
      ))}
    </div>
  );
}
