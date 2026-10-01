import { ArrowLeft, LoaderCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useDataset } from "../features/datasets/queries";
import DatasetOverview from "../features/upload/DatasetOverview";

export default function DatasetPage() {
  const { datasetId } = useParams();

  const {
    data: dataset,
    isLoading,
    error,
  } = useDataset(datasetId ?? "");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <LoaderCircle
          className="animate-spin text-zinc-400"
          size={24}
        />
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-zinc-900">
            Dataset unavailable
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            We couldn't load this dataset.
          </p>

          <Link
            to="/"
            className="mt-6 inline-block text-sm font-medium text-zinc-900 underline"
          >
            Return home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900"
          >
            <ArrowLeft size={16} />
            DataLens
          </Link>
        </div>
      </header>

      <DatasetOverview dataset={dataset} />
    </main>
  );
}