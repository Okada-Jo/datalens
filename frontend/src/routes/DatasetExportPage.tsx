import { gettext as t, useLocale } from "../i18n";
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
  useLocale();
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
          {t("Export")}</h2>

        <p className="mt-1 text-sm text-zinc-500">
          {t("Download the current transformed dataset.")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ExportCard
          title={t("CSV")}
          description={t("Download the dataset as a comma-separated values file.")}
          icon={<FileSpreadsheet size={20} />}
          onDownload={() => handleDownload("csv")}
        />

        <ExportCard
          title={t("JSON")}
          description={t("Download the dataset as an array of JSON objects.")}
          icon={<FileJson size={20} />}
          onDownload={() => handleDownload("json")}
        />
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-sm text-zinc-600">
          {t("Exports include all transformations currently applied to the dataset. The original uploaded file remains unchanged.")}</p>
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
  useLocale();
  return (
    <div className="rounded-xl border border-zinc-200 bg-surface p-5">
      <div className="flex items-center gap-2 text-zinc-900">
        {icon}

        <h3 className="font-medium">
          {t(title)}
        </h3>
      </div>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {t(description)}
      </p>

      <button
        type="button"
        onClick={onDownload}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
      >
        <Download size={15} />
        {t("Download")}{t(title)}
      </button>
    </div>
  );
}