import { Hono } from "hono";
import { handle } from "hono/vercel";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import getDeckboxDecklistFromMoxfield, {
  checkMoxfieldUrl,
} from "../clients/moxfield";

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath("/api");

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!" });
});

// Decklist
// ------------------------------

const decklistSchema = z.object({
  url: z.string().url(),
});

app.get("/decklist", zValidator("query", decklistSchema), async (c) => {
  const { url } = c.req.valid("query");
  if (checkMoxfieldUrl(url)) {
    const decklist = await getDeckboxDecklistFromMoxfield(url);
    return c.json({ decklist });
  }
  return c.json({ message: "Invalid URL" }, 400);
});

// Error handling
// ------------------------------

app.notFound((c) => {
  return c.json({ message: "Not Found" }, 404);
});

export default handle(app);