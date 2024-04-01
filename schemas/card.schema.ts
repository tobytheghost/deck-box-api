import { z } from "zod";

export const cardSchema = z.object({
  id: z.string(),
  scryfallId: z.string(),
  name: z.string(),
  set: z.string(),
  quantity: z.number(),
  isFoil: z.boolean(),
  isAlter: z.boolean(),
  isProxy: z.boolean(),
  images: z.object({
    small: z.string(),
    normal: z.string(),
    large: z.string(),
  }),
});
