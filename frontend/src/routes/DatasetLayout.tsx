import { LanguageSelect } from "../components/LanguageSelect";
import { gettext as t, getLocale, useLocale } from "../i18n";
import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { Brand } from "../components/Brand";
import { ThemeToggle } from "../components/ThemeToggle";
import { useDataset } from "../features/datasets/queries";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";

export function DatasetLayout() {
  useLocale();
  const { datasetId } = useParams();
  const { data: dataset } = useDataset(datasetId);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const expiry = dataset ? new Date(dataset.expiresAt) : null;
  const expired = expiry !== null && now >= expiry.getTime();


  if (!datasetId) {
    return null;
  }

  const tabs = [
    {
      label: "Overview",
      to: `/datasets/${datasetId}`,
      end: true,
    },
    {
      label: "Explore",
      to: `/datasets/${datasetId}/explore`,
      end: false,
    },
    {
      label: "Clean",
      to: `/datasets/${datasetId}/clean`,
      end: false,
    },
    {
      label: "Visualize",
      to: `/datasets/${datasetId}/visualize`,
      end: false,
    },
    {
      label: "Export",
      to: `/datasets/${datasetId}/export`,
      end: false,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Brand />
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <LanguageSelect /><ThemeToggle />
        <Link
          to="/"
          className="text-sm font-medium border border-dotted p-2 rounded-4xl text-zinc-500 transition hover:text-zinc-900"
        >
          {t("Upload new dataset")}</Link>
        </div>
      </header>
      <div className="retention-banner mb-6 flex items-start gap-3">
        <Clock3 size={18} className="mt-0.5 shrink-0" />
        <p>{expiry ? <time dateTime={dataset!.expiresAt}>{t("This file expires on {date}.", { date: expiry.toLocaleString(getLocale(), { dateStyle: "medium", timeStyle: "short" }) })}</time> : t("Uploads expire after 24 hours.")}{" "}
          {expired ? t("This dataset has expired.") : t("Files and edits are permanently deleted. Export anything you want to keep.")}</p>
      </div>
      <nav className="mb-8 border-b border-zinc-200">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <NavLink
              key={t(tab.label)}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                [
                  "-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition",
                  isActive
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-800",
                ].join(" ")
              }
            >
              {t(tab.label)}
            </NavLink>
          ))}
        </div>
      </nav>

      {expired ? <div className="rounded-xl border border-zinc-200 bg-surface p-8 text-center"><h1 className="text-xl font-semibold">{t("This dataset has expired")}</h1><p className="mt-2 text-zinc-500">{t("Upload a CSV to start a new session.")}</p><Link to="/" className="accent-text mt-4 inline-block">{t("Upload a dataset →")}</Link></div> : <Outlet />}
    </main>
  );
}