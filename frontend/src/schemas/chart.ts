import { z } from "zod";

export const chartAggregationSchema = z.enum([
  "sum",
  "average",
  "count",
]);

export const chartDataPointSchema = z.object({
  x: z.union([
    z.string(),
    z.number(),
    z.null(),
  ]),
  y: z.number(),
});

export const chartResponseSchema = z.object({
  x: z.string(),
  y: z.string().nullable(),
  aggregation: chartAggregationSchema,
  data: z.array(chartDataPointSchema),
});

export type ChartAggregation = z.infer<
  typeof chartAggregationSchema
>;

export type ChartResponse = z.infer<
  typeof chartResponseSchema
>;