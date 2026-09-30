import { Link, NavLink, Outlet, useParams } from "react-router-dom";

export function DatasetLayout() {
  const { datasetId } = useParams();

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
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-zinc-900"
        >
          DataLens
        </Link>

        <Link
          to="/"
          className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
        >
          Upload new dataset
        </Link>
      </header>
      <nav className="mb-8 border-b border-zinc-200">
        <div className="flex gap-6">
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

      <Outlet />
    </main>
  );
}