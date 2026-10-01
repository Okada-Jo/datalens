import { gettext as t, useLocale } from "../i18n";
import { DataError } from "../components/DataError";
import { useParams } from "react-router-dom";

import { TransformationForm } from "../components/TransformationForm";
import { TransformationHistory } from "../components/TransformationHistory";
import { useDatasetRows } from "../features/datasets/queries";
import { useTransformations } from "../hooks/useTransformations";

export function DatasetCleanPage() {
  useLocale();
  const { datasetId } = useParams();

  const {
    data: transformations,
    isLoading: isTransformationsLoading,
    error: transformationsError,
  } = useTransformations(datasetId);

  const {
    data: rowsData,
    isLoading: isRowsLoading,
    error: rowsError,
  } = useDatasetRows(
    datasetId!,
    1,
    1,
    null,
    [],
    "",
  );

  if (!datasetId) {
    return null;
  }

  const columns = rowsData?.columns ?? [];

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900">
          {t("Clean")}</h2>

        <p className="mt-1 text-sm text-zinc-500">
          {t("Clean and transform your dataset without modifying the original file.")}</p>
      </div>

      <div>
        <h3 className="font-medium text-zinc-900">
          {t("Add transformation")}</h3>

        {isRowsLoading ? (
          <p className="mt-3 text-sm text-zinc-500">
            {t("Loading columns...")}</p>
        ) : rowsError ? (
          <div className="mt-3"><DataError title={t("Unable to load columns")} error={rowsError}>
            <p>{t("Review the transformation history below and undo the step causing the error.")}</p>
          </DataError></div>
        ) : (
          <TransformationForm
            datasetId={datasetId}
            columns={columns}
          />
        )}
      </div>

      <div className="mt-8">
        <h3 className="font-medium text-zinc-900">
          {t("Transformation history")}</h3>

        {isTransformationsLoading ? (
          <p className="mt-3 text-sm text-zinc-500">
            {t("Loading transformations...")}</p>
        ) : transformationsError ? (
          <p className="mt-3 text-sm text-red-600">
            {t("Transformations could not be loaded.")}</p>
        ) : (
          <TransformationHistory
            datasetId={datasetId}
            transformations={transformations ?? []}
          />
        )}
      </div>
    </section>
  );
}