import { datasetSchema, datasetsSchema } from "../schemas/dataset";
import { datasetRowsSchema } from "../schemas/datasetRows";

const API_URL = "http://localhost:8000/api";

export type SortDirection = "asc" | "desc";

export type FilterOperator =
  | "contains"
  | "equals"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "is_missing"
  | "is_not_missing";

export interface DatasetFilter {
  column: string;
  operator: FilterOperator;
  value?: string;
}

export interface DatasetSort {
  column: string;
  direction: SortDirection;
}

export async function getDatasets() {
  const response = await fetch(`${API_URL}/datasets/`);

  if (!response.ok) {
    throw new Error("Failed to fetch datasets.");
  }

  const data: unknown = await response.json();

  return datasetsSchema.parse(data);
}

export async function getDataset(id: string) {
  const response = await fetch(`${API_URL}/datasets/${id}/`);

  if (!response.ok) {
    throw new Error("Failed to fetch dataset.");
  }

  const data: unknown = await response.json();

  return datasetSchema.parse(data);
}

export async function uploadDataset(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_URL}/datasets/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.detail ?? "Failed to upload dataset.",
    );
  }

  const data: unknown = await response.json();

  return datasetSchema.parse(data);
}

export async function getDatasetRows(
  id: string,
  page: number,
  pageSize: number,
  sort: DatasetSort | null,
  filters: DatasetFilter[],
  search: string,
) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (sort) {
    params.set("sort", sort.column);
    params.set("direction", sort.direction);
  }

  if (filters.length > 0) {
    params.set("filters", JSON.stringify(filters));
  }

  if (search.trim()) {
    params.set(
      "search",
      search.trim(),
    );
  }

  const response = await fetch(
    `${API_URL}/datasets/${id}/rows/?${params}`,
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.detail ?? "Failed to fetch dataset rows.",
    );
  }

  const data: unknown = await response.json();

  return datasetRowsSchema.parse(data);
}