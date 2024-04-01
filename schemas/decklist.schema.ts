import { z } from "zod";
import { cardSchema } from "./card.schema";

export const decklistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  format: z.string(),
  publicUrl: z.string().url(),
  createdBy: z.string(),
  createdAt: z.string(),
  lastUpdated: z.string(),
  importedFrom: z.string(),
  commanders: z.array(cardSchema),
  mainboard: z.array(cardSchema),
});
