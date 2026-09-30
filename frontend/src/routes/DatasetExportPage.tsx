import {
  Download,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import { useParams } from "react-router-dom";

import {
  getDatasetExportUrl,
  type ExportFormat,
} from "../lib/api";

export function DatasetExportPage() {
  const { datasetId } = useParams();

  if (!datasetId) {
    return null;
  }

  function handleDownload(format: ExportFormat) {
    window.location.href = getDatasetExportUrl(
      datasetId!,
      format,
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900">
          Export
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Download the current transformed dataset.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ExportCard
          title="CSV"
          description="Download the dataset as a comma-separated values file."
          icon={<FileSpreadsheet size={20} />}
          onDownload={() => handleDownload("csv")}
        />

        <ExportCard
          title="JSON"
          description="Download the dataset as an array of JSON objects."
          icon={<FileJson size={20} />}
          onDownload={() => handleDownload("json")}
        />
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-sm text-zinc-600">
          Exports include all transformations currently
          applied to the dataset. The original uploaded file
          remains unchanged.
        </p>
      </div>
    </section>
  );
}

interface ExportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onDownload: () => void;
}

function ExportCard({
  title,
  description,
  icon,
  onDownload,
}: ExportCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center gap-2 text-zinc-900">
        {icon}

        <h3 className="font-medium">
          {title}
        </h3>
      </div>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onDownload}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
      >
        <Download size={15} />
        Download {title}
      </button>
    </div>
  );
}