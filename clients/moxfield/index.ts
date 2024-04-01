import { decklistSchema } from "../../schemas/decklist.schema";
import { z } from "zod";
import { getScryfallImagesFromUid } from "../scryfall";

type MoxfieldDecklist = Awaited<ReturnType<typeof getMoxfieldDeckData>>;
type MoxfieldCard = z.infer<typeof moxfieldCardSchema>;

type DeckboxDecklist = z.infer<typeof decklistSchema>;

const moxfieldCardSchema = z.object({
  card: z.object({
    id: z.string(),
    scryfall_id: z.string(),
    name: z.string(),
    set: z.string(),
  }),
  quantity: z.number(),
  isFoil: z.boolean(),
  isAlter: z.boolean(),
  isProxy: z.boolean(),
});

const moxfieldDecklistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  format: z.string(),
  publicUrl: z.string(),
  boards: z.object({
    commanders: z.object({
      count: z.number(),
      cards: z.record(z.string(), moxfieldCardSchema),
    }),
    mainboard: z.object({
      count: z.number(),
      cards: z.record(z.string(), moxfieldCardSchema),
    }),
  }),
});

const mapMoxfieldCardToDeckboxCard = (card: MoxfieldCard) => ({
  id: card.card.id,
  scryfallId: card.card.scryfall_id,
  name: card.card.name,
  set: card.card.set,
  quantity: card.quantity,
  isFoil: card.isFoil,
  isAlter: card.isAlter,
  isProxy: card.isProxy,
  images: getScryfallImagesFromUid(card.card.scryfall_id),
});

const mapToDecklist = (moxfieldDecklist: MoxfieldDecklist): DeckboxDecklist => {
  return {
    commanders: Object.values(moxfieldDecklist.boards.commanders.cards).map(
      mapMoxfieldCardToDeckboxCard
    ),
    mainboard: Object.values(moxfieldDecklist.boards.mainboard.cards).map(
      mapMoxfieldCardToDeckboxCard
    ),
  };
};

const getDeckId = (url: string) => {
  const parts = url.split("/");
  const index = parts.indexOf("decks");
  if (index !== -1 && index < parts.length - 1) return parts[index + 1];
  return undefined;
};

const getMoxfieldDeckData = async (deckId: string) => {
  const url = `https://api2.moxfield.com/v3/decks/all/${deckId}`;
  const response = await fetch(url);
  const data = await response.json();
  return moxfieldDecklistSchema.parse(data);
};

const getDeckboxDecklistFromMoxfield = async (url: string) => {
  if (!checkMoxfieldUrl(url)) throw new Error("Invalid deck URL");
  const deckId = getDeckId(url);
  if (!deckId) throw new Error("Invalid deck URL");
  const moxfieldDecklist = await getMoxfieldDeckData(deckId);
  return mapToDecklist(moxfieldDecklist);
};

export const checkMoxfieldUrl = (url: string) => {
  return /moxfield.com\/decks\/[a-zA-Z0-9]+/.test(url);
};

export default getDeckboxDecklistFromMoxfield;
