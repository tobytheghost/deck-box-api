import { z } from "zod";
import { decklistSchema } from "../../schemas/decklist.schema";
import { getScryfallImagesFromUid } from "../scryfall";

type ArchitektDecklist = z.infer<typeof archidektDecklistSchema>;
type ArchitektCard = z.infer<typeof archidektCardSchema>;

type DeckboxDecklist = z.infer<typeof decklistSchema>;

const archidektCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  setCode: z.string(),
  uid: z.string(),
  modifier: z.string(),
  qty: z.number(),
  categories: z.array(z.string()),
});

const archidektDecklistSchema = z.object({
  props: z.object({
    pageProps: z.object({
      redux: z.object({
        deck: z.object({
          id: z.number(),
          name: z.string(),
          format: z.number(),
          owner: z.string(),
          updatedAt: z.string(),
          createdAt: z.string(),
          cardMap: z.record(z.string(), archidektCardSchema),
        }),
      }),
    }),
  }),
  query: z.object({
    deckInfo: z.array(z.string()),
  }),
});

const archidektFormatMap = {
  1: "standard",
  2: "modern",
  3: "commander",
  4: "legacy",
  5: "vintage",
  6: "pauper",
  7: "custom",
  8: "frontier",
  9: "future-standard",
  10: "penny-dreadful",
  11: "1v1-commander",
  12: "duel-commander",
  13: "brawl",
  14: "oathbreaker",
  15: "pioneer",
  16: "historic",
  17: "pauper-commander",
  18: "alchemy",
  19: "explorer",
  20: "historic-brawl",
  21: "gladiator",
  22: "premodern",
  23: "predh",
  24: "timeless",
} as const;

const getArchidektDeckData = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch deck data");
  const html = await response.text();
  const script = html
    .split(`<script id="__NEXT_DATA__" type="application/json">`)[1]
    .split("</script>")[0];
  if (!script) throw new Error("Failed to parse deck data");
  const data = JSON.parse(script);
  return archidektDecklistSchema.parse(data);
};

const mapArchitektCardToDeckboxCard = (card: ArchitektCard) => ({
  id: card.id,
  scryfallId: card.uid,
  name: card.name,
  set: card.setCode,
  quantity: card.qty,
  isFoil: card.modifier.toLowerCase() === "foil",
  isAlter: false,
  isProxy: false,
  images: getScryfallImagesFromUid(card.uid),
});

const mapToDecklist = (
  archidektDecklist: ArchitektDecklist
): DeckboxDecklist => {
  const { deck } = archidektDecklist.props.pageProps.redux;
  const cards = Object.values(deck.cardMap);
  return {
    id: `${deck.id}`,
    importedFrom: "archidekt",
    name: deck.name,
    description: "",
    format:
      archidektFormatMap[deck.format as keyof typeof archidektFormatMap] ||
      "custom",
    publicUrl: `https://www.archidekt.com/decks/${archidektDecklist.query.deckInfo[0]}/${archidektDecklist.query.deckInfo[1]}`,
    createdAt: deck.createdAt,
    lastUpdated: deck.updatedAt,
    createdBy: deck.owner,
    commanders: cards
      .filter((card) => card.categories.includes("Commander"))
      .map(mapArchitektCardToDeckboxCard),
    mainboard: cards
      .filter((card) => !card.categories.includes("Commander"))
      .map(mapArchitektCardToDeckboxCard),
  };
};

const getDeckboxDecklistFromArchidekt = async (url: string) => {
  if (!checkArchidektUrl(url)) throw new Error("Invalid deck URL");
  const archidektDecklist = await getArchidektDeckData(url);
  return mapToDecklist(archidektDecklist);
};

export const checkArchidektUrl = (url: string) => {
  return /archidekt.com\/decks\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/.test(url);
};

export default getDeckboxDecklistFromArchidekt;
