import { z } from "zod";

export const sampleSchema = z.object({
  id: z.string(),
  name: z.string(),
  topic: z.string(),
  description: z.string(),
  rowCount: z.number(),
  columnCount: z.number(),
  fileSize: z.number(),
});
export const samplesSchema = z.array(sampleSchema);
