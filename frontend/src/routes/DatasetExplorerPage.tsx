import { useParams } from "react-router-dom";

import DataExplorer from "../features/datasets/DataExplorer";
import { useDataset } from "../features/datasets/queries";

export function DatasetExplorePage() {
  const { datasetId } = useParams();

  const {
    data: dataset,
    isLoading,
    error,
  } = useDataset(datasetId);

  if (!datasetId) {
    return null;
  }

  if (isLoading) {
    return (
      <p className="text-sm text-zinc-500">
        Loading dataset...
      </p>
    );
  }

  if (error || !dataset) {
    return (
      <p className="text-sm text-red-600">
        Dataset could not be loaded.
      </p>
    );
  }

  const columns =
    "columns" in dataset.analysis
      ? dataset.analysis.columns
      : [];

  return (
    <section className="mx-auto max-w-8xl px-4 py-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900">
          Explore
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Search, filter and sort the dataset.
        </p>
      </div>

      <DataExplorer
        datasetId={dataset.id}
        columns={columns}
      />
    </section>
  );
}