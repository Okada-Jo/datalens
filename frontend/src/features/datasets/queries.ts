import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { getDataset, getDatasetRows, getDatasets, type DatasetFilter, type DatasetSort } from "../../lib/api";

export function useDatasets() {
  return useQuery({
    queryKey: ["datasets"],
    queryFn: getDatasets,
  });
}

export function useDataset(id: string) {
  return useQuery({
    queryKey: ["datasets", id],
    queryFn: () => getDataset(id),
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
  });
}