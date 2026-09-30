import {
  Columns3,
  Database,
  FileSpreadsheet,
  Rows3,
  ArrowRight,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import { type Dataset } from "../../schemas/dataset";
import { formatNumber } from "../../lib/format";
import { formatFileSize } from "../upload/fileUtils";
import ColumnCard from "./ColumnCard";


interface DatasetOverviewProps {
  dataset: Dataset;
}

export default function DatasetOverview({
  dataset,
}: DatasetOverviewProps) {
  const columns = dataset.analysis.columns ?? [];

  const missingValues = columns.reduce(
    (total, column) => total + column.missing_count,
    0,
  );

  return (
    <div className="mx-auto max-w-8xl px-4 py-4">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600">
            <FileSpreadsheet size={21} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              {dataset.name}
            </h1>

            <p className="mt-0.5 text-sm text-zinc-500">
              {dataset.originalFilename}
            </p>
          </div>
        </div>
        <div>
          <Link
            to={`/datasets/${dataset.id}/explore`}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
            Explore data
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Rows3 size={18} />}
          label="Rows"
          value={formatNumber(dataset.rowCount ?? 0)}
        />

        <MetricCard
          icon={<Columns3 size={18} />}
          label="Columns"
          value={formatNumber(dataset.columnCount ?? 0)}
        />

        <MetricCard
          icon={<Database size={18} />}
          label="File size"
          value={formatFileSize(dataset.fileSize)}
        />

        <MetricCard
          icon={<span className="text-sm font-semibold">%</span>}
          label="Missing values"
          value={formatNumber(missingValues)}
        />
      </div>

      <section className="mt-10">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Columns
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Types and statistics inferred from your dataset.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {columns.map((column) => (
            <ColumnCard
              key={column.name}
              column={column}
              rowCount={dataset.rowCount ?? 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function MetricCard({
  icon,
  label,
  value,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center gap-2 text-zinc-400">
        {icon}

        <span className="text-sm">{label}</span>
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
        {value}
      </p>
    </div>
  );
}