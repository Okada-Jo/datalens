import { z } from "zod";

export const datasetCellSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const datasetRowSchema = z.record(
  z.string(),
  datasetCellSchema,
);

export const datasetRowsSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalRows: z.number(),
  totalPages: z.number(),
  columns: z.array(z.string()),
  rows: z.array(datasetRowSchema),
});

export type DatasetCell = z.infer<typeof datasetCellSchema>;
export type DatasetRow = z.infer<typeof datasetRowSchema>;
export type DatasetRows = z.infer<typeof datasetRowsSchema>;