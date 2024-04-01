import { z } from "zod";
import { decklistSchema } from "../../schemas/decklist.schema";
import { getScryfallImagesFromUid } from "../scryfall";

type ArchitektDecklist = Awaited<ReturnType<typeof getArchidektDeckData>>;
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
          name: z.string(),
          owner: z.string(),
          updatedAt: z.string(),
          createdAt: z.string(),
          cardMap: z.record(z.string(), archidektCardSchema),
        }),
      }),
    }),
  }),
});

const getArchidektDeckData = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch deck data");
  const html = await response.text();
  const script = html
    .split(`<script id="__NEXT_DATA__" type="application/json">`)[1]
    .split("</script>")[0];
  if (!script) throw new Error("Failed to parse deck data");
  const data = JSON.parse(script);
  //   return data;
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
  const cards = Object.values(
    archidektDecklist.props.pageProps.redux.deck.cardMap
  );
  return {
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
