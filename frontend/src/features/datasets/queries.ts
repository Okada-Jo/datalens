import { retryDataQuery } from "../../lib/apiError";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { getDataset, getDatasetChart, getDatasetRows, getDatasets, type DatasetFilter, type DatasetSort } from "../../lib/api";
import type { ChartAggregation } from "../../schemas/chart";

export function useDatasets() {
  return useQuery({
    queryKey: ["datasets"],
    queryFn: getDatasets,
  });
}

export function useDataset(id: string | undefined) {
  return useQuery({
    queryKey: ["datasets", id],
    queryFn: () => {
      if (!id) {
        throw new Error("Dataset ID is required.");
      }

      return getDataset(id);
    },
    enabled: Boolean(id),
  });
}

export function useDatasetRows(
  id: string,
  page: number,
  pageSize: number,
  sort: DatasetSort | null,
  filters: DatasetFilter[],
  search: string,
) {
  return useQuery({
    queryKey: [
      "datasets",
      id,
      "rows",
      page,
      pageSize,
      sort,
      filters,
      search,
    ],
    queryFn: () =>
      getDatasetRows(
        id,
        page,
        pageSize,
        sort,
        filters,
        search,
      ),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
    retry: retryDataQuery,
  });
}

export function useDatasetChart(
  datasetId: string | undefined,
  x: string,
  y: string,
  aggregation: ChartAggregation,
) {
  return useQuery({
    queryKey: [
      "datasets",
      datasetId,
      "chart",
      x,
      y,
      aggregation,
    ],

    queryFn: () => {
      if (!datasetId) {
        throw new Error(
          "Dataset ID is required.",
        );
      }

      return getDatasetChart(
        datasetId,
        x,
        y,
        aggregation,
      );
    },

    retry: retryDataQuery,
    enabled: Boolean(
      datasetId &&
      x &&
      (
        aggregation === "count" ||
        y
      ),
    ),
  });
}