import { z } from "zod";

export const cardSchema = z.object({
  id: z.string(),
  uniqueCardId: z.string(),
  name: z.string(),
  set: z.string(),
  layout: z.string(),
  isFoil: z.boolean(),
  isAlter: z.boolean(),
  isProxy: z.boolean(),
});
