import { z } from "zod";
import { cardSchema } from "./card.schema";

export const decklistSchema = z.object({
  commanders: z.array(cardSchema),
  mainboard: z.array(cardSchema),
});
