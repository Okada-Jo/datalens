import { LanguageSelect } from "../components/LanguageSelect";
import { gettext as t, useLocale } from "../i18n";
import { ArrowUpRight, ChartNoAxesCombined, Clock3, SlidersHorizontal, Table2 } from "lucide-react";
import UploadDataset from "../features/upload/UploadDataset";
import { Brand } from "../components/Brand";
import { ThemeToggle } from "../components/ThemeToggle";

export default function HomePage() {
  useLocale();
  return (
    <main className="home-shell min-h-screen">
      <header className="border-b border-zinc-200 bg-surface">
        <div className="mx-auto flex min-h-20 max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Brand /><div className="flex flex-wrap items-center gap-2"><LanguageSelect /><ThemeToggle /></div>
        </div>
      </header>
      <div className="relative mx-auto max-w-3xl px-6 py-12 sm:py-20">
        <div className="text-center">
          <p className="eyebrow"><span /> {t("A LITTLE CLARITY FOR YOUR CSV")}</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-6xl">
            {t("Raw data.")}<br /><span className="accent-text">{t("Fresh perspective.")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-zinc-500">
            {t("Turn a spreadsheet into something that makes sense. Explore, tidy up, and find the story in your data.")}</p>
        </div>
        <div className="upload-panel mt-9"><UploadDataset /></div>
        <div className="retention-note mt-4 flex items-start justify-center gap-2 text-sm">
          <Clock3 size={17} className="mt-0.5 shrink-0" />
          <p>{t("Files are automatically deleted after 24 hours. Export your work before then.")}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[{ Icon: Table2, title: "Meet your data", text: "Spot patterns and missing pieces." },
            { Icon: SlidersHorizontal, title: "Make it shine", text: "Clean up without changing the original." },
            { Icon: ChartNoAxesCombined, title: "See the story", text: "Bring your numbers into focus." }].map(({ Icon, title, text }) => (
            <div key={title} className="feature-card">
              <Icon size={20} className="accent-text" /><h2 className="mt-3 text-sm font-semibold text-zinc-900">{t(title)}</h2>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{t(text)}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-500">{t("No account. Just curiosity.")}<ArrowUpRight size={14} /></p>
      </div>
    </main>
  );
}
