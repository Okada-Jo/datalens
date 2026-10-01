import { gettext as t, useLocale } from "../i18n";
import { useParams } from "react-router-dom";

import { useDataset } from "../features/datasets/queries";
import DatasetOverview from "../features/upload/DatasetOverview";

export function DatasetOverviewPage() {
  useLocale();
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
        {t("Loading dataset...")}</p>
    );
  }

  if (error || !dataset) {
    return (
      <p className="text-sm text-red-600">
        {t("Dataset could not be loaded.")}</p>
    );
  }

  return <DatasetOverview dataset={dataset} />;
}