import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { Brand } from "../components/Brand";
import { ThemeToggle } from "../components/ThemeToggle";
import { useDataset } from "../features/datasets/queries";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";

export function DatasetLayout() {
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
        <div className="flex items-center gap-3 sm:gap-5">
          <ThemeToggle />
        <Link
          to="/"
          className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
        >
          Upload new dataset
        </Link>
        </div>
      </header>
      <div className="retention-banner mb-6 flex items-start gap-3">
        <Clock3 size={18} className="mt-0.5 shrink-0" />
        <p>{expiry ? <>This file expires <time dateTime={dataset!.expiresAt}>{expiry.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</time>. </> : <>Uploads expire after 24 hours. </>}
          {expired ? "This dataset has expired." : "Files and edits are permanently deleted. Export anything you want to keep."}</p>
      </div>
      <nav className="mb-8 border-b border-zinc-200">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
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
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {expired ? <div className="rounded-xl border border-zinc-200 bg-surface p-8 text-center"><h1 className="text-xl font-semibold">This dataset has expired</h1><p className="mt-2 text-zinc-500">Upload a CSV to start a new session.</p><Link to="/" className="accent-text mt-4 inline-block">Upload a dataset →</Link></div> : <Outlet />}
    </main>
  );
}