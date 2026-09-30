import { NavLink, Outlet, useParams } from "react-router-dom";

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
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
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