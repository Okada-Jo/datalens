import { useParams } from "react-router-dom";

import { useTransformations } from "../hooks/useTransformations";
import { useDataset } from "../features/datasets/queries";
import { TransformationHistory } from "../components/TransformationHistory";
import { TransformationForm } from "../components/TransformationForm";

export function DatasetCleanPage() {
  const { datasetId } = useParams();

  const {
    data: dataset,
  } = useDataset(datasetId);

  const {
    data: transformations,
    isLoading: isTransformationsLoading,
    error,
  } = useTransformations(datasetId);

  if (!datasetId) {
    return null;
  }
  const columns =
    dataset && "columns" in dataset.analysis
      ? dataset.analysis.columns
      : [];

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900">
          Clean
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Clean and transform your dataset without modifying the original file.
        </p>
      </div>

      <div>
        <TransformationForm
          datasetId={datasetId}
          columns={columns}
        />
      </div>

      <div className="mt-8">
        <div className="mt-8">
          <h3 className="font-medium text-zinc-900">
            Transformation history
          </h3>

          {isTransformationsLoading ? (
            <p className="mt-3 text-sm text-zinc-500">
              Loading transformations...
            </p>
          ) : error ? (
            <p className="mt-3 text-sm text-red-600">
              Transformations could not be loaded.
            </p>
          ) : (
            <TransformationHistory
              datasetId={datasetId}
              transformations={transformations ?? []}
            />
          )}
        </div>
      </div>
    </section>
  );
}