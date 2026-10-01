import { readApiError } from "./apiError";
import { samplesSchema } from "../schemas/sample";
import { chartResponseSchema, type ChartAggregation, type ChartResponse } from "../schemas/chart";
import { datasetSchema, datasetsSchema } from "../schemas/dataset";
import { datasetRowsSchema } from "../schemas/datasetRows";
import { transformationSchema, transformationsSchema, type TransformationType } from "../schemas/transformation";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:8000/api";
export type ExportFormat = "csv" | "json";

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

export interface CreateTransformationInput {
  type: TransformationType;
  config: Record<string, unknown>;
}

export async function getDatasets() {
  const response = await fetch(`${API_BASE_URL}/datasets/`);

  if (!response.ok) {
    throw new Error("Failed to fetch datasets.");
  }

  const data: unknown = await response.json();

  return datasetsSchema.parse(data);
}

export async function getDataset(id: string) {
  const response = await fetch(`${API_BASE_URL}/datasets/${id}/`);

  if (!response.ok) {
    throw new Error("Failed to fetch dataset.");
  }

  const data: unknown = await response.json();

  return datasetSchema.parse(data);
}

export async function uploadDataset(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/datasets/`, {
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
    `${API_BASE_URL}/datasets/${id}/rows/?${params}`,
  );

  if (!response.ok) {
    throw await readApiError(response, "Dataset rows could not be loaded. Please try again.");
  }

  const data: unknown = await response.json();

  return datasetRowsSchema.parse(data);
}

export async function getTransformations(
  datasetId: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/datasets/${datasetId}/transformations/`,
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load transformations.",
    );
  }

  const data = await response.json();

  return transformationsSchema.parse(data);
}

export async function createTransformation(
  datasetId: string,
  input: CreateTransformationInput,
) {
  const response = await fetch(
    `${API_BASE_URL}/datasets/${datasetId}/transformations/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to create transformation.",
    );
  }

  const data = await response.json();

  return transformationSchema.parse(data);
}

export async function deleteTransformation(
  datasetId: string,
  transformationId: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/datasets/${datasetId}/transformations/${transformationId}/`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to delete transformation.",
    );
  }
}

export function getDatasetExportUrl(
  datasetId: string,
  format: ExportFormat,
): string {
  return `${API_BASE_URL}/datasets/${datasetId}/export/?type=${format}`;
}

export async function getDatasetChart(
  datasetId: string,
  x: string,
  y: string,
  aggregation: ChartAggregation,
): Promise<ChartResponse> {
  const params = new URLSearchParams({
    x,
    aggregation,
  });

  if (aggregation !== "count" && y) {
    params.set("y", y);
  }

  const response = await fetch(
    `${API_BASE_URL}/datasets/${datasetId}/chart/?${params}`,
  );

  if (!response.ok) {
    throw await readApiError(response, "The chart could not be loaded. Please try again.");
  }

  const data = await response.json();

  return chartResponseSchema.parse(data);
}

export async function getSamples() {
  const response = await fetch(`${API_BASE_URL}/datasets/samples/`);
  if (!response.ok) throw new Error("Sample datasets could not be loaded.");
  return samplesSchema.parse(await response.json());
}

export async function useSample(sampleId: string) {
  const response = await fetch(`${API_BASE_URL}/datasets/samples/${encodeURIComponent(sampleId)}/use/`, { method: "POST" });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail ?? "This sample could not be opened. Please try again.");
  }
  return datasetSchema.parse(await response.json());
}
