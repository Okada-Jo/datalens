import { useQuery } from "@tanstack/react-query";

import { getDataset, getDatasetRows, getDatasets } from "../../lib/api";

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
) {
  return useQuery({
    queryKey: ["datasets", id, "rows", page, pageSize],
    queryFn: () => getDatasetRows(id, page, pageSize),
    enabled: Boolean(id),
  });
}