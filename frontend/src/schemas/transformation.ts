import { z } from "zod";

export const transformationTypeSchema = z.enum([
  "fill_missing",
  "rename_column",
  "replace_value",
  "delete_column",
]);

export const transformationSchema = z.object({
  id: z.string(),
  type: transformationTypeSchema,
  config: z.record(
    z.string(),
    z.unknown(),
  ),
  position: z.number(),
  createdAt: z.string(),
});

export const transformationsSchema = z.array(
  transformationSchema,
);

export type Transformation = z.infer<
  typeof transformationSchema
>;

export type TransformationType = z.infer<
  typeof transformationTypeSchema
>;