import {
  Columns3,
  Database,
  FileSpreadsheet,
  Rows3,
} from "lucide-react";

import { type Dataset } from "../../schemas/dataset";
import { formatNumber } from "../../lib/format";
import { formatFileSize } from "../upload/fileUtils";
import ColumnCard from "./ColumnCard";
import DataExplorer from "../datasets/DataExplorer";


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
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mt-8 flex gap-1 border-b border-zinc-200">
        <span className="border-b-2 border-zinc-900 px-4 py-3 text-sm font-medium text-zinc-900">
          Overview
        </span>
      </div>

      <div>
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

      <section className="mt-12">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Data preview
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Browse the rows in this dataset.
          </p>
        </div>

        <div className="mt-5">
          <DataExplorer
            datasetId={dataset.id}
            columns={columns}
          />
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