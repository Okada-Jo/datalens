import { z } from "zod";

export const datasetStatusSchema = z.enum([
  "uploaded",
  "processing",
  "ready",
  "failed",
]);

export const columnTypeSchema = z.enum([
  "number",
  "date",
  "text",
  "category",
  "boolean",
]);

const numericStatisticsSchema = z.object({
  min: z.number(),
  max: z.number(),
  mean: z.number(),
  median: z.number(),
  std: z.number().nullable(),
});

const dateStatisticsSchema = z.object({
  min: z.string(),
  max: z.string(),
});

const topValueSchema = z.object({
  value: z.string(),
  count: z.number(),
});

const categoricalStatisticsSchema = z.object({
  top_values: z.array(topValueSchema),
});

export const columnAnalysisSchema = z.object({
  name: z.string(),
  type: columnTypeSchema,
  missing_count: z.number(),
  missing_percentage: z.number(),
  unique_count: z.number(),
  statistics: z
    .union([
      numericStatisticsSchema,
      dateStatisticsSchema,
      categoricalStatisticsSchema,
    ])
    .optional(),
});

export const datasetAnalysisSchema = z.object({
  row_count: z.number(),
  column_count: z.number(),
  columns: z.array(columnAnalysisSchema),
});

export const datasetSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  originalFilename: z.string(),
  fileSize: z.number(),
  rowCount: z.number().nullable(),
  columnCount: z.number().nullable(),
  status: datasetStatusSchema,
  analysis: datasetAnalysisSchema.or(z.object({})),
  createdAt: z.string(),
});

export const datasetsSchema = z.array(datasetSchema);

export type Dataset = z.infer<typeof datasetSchema>;
export type DatasetAnalysis = z.infer<typeof datasetAnalysisSchema>;
export type ColumnAnalysis = z.infer<typeof columnAnalysisSchema>;
export type ColumnType = z.infer<typeof columnTypeSchema>;