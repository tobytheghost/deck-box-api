import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import getDeckboxDecklistFromMoxfield, {
  checkMoxfieldUrl,
} from "../clients/moxfield";
import getDeckboxDecklistFromArchidekt, {
  checkArchidektUrl,
} from "../clients/archidekt";

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath("/api");

app.use("*", (c, next) => {
  const wrapped = cors({
    origin: "http://localhost:3000",
  });
  return wrapped(c, next);
});

// Decklist
// ------------------------------

const decklistSchema = z.object({
  url: z.string().url(),
});

app.get("/decklist", zValidator("query", decklistSchema), async (c) => {
  try {
    const { url } = c.req.valid("query");
    if (checkMoxfieldUrl(url)) {
      const decklist = await getDeckboxDecklistFromMoxfield(url);
      return c.json({ decklist });
    }
    if (checkArchidektUrl(url)) {
      const decklist = await getDeckboxDecklistFromArchidekt(url);
      return c.json({ decklist });
    }
    return c.json({ message: "Invalid URL" }, 400);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Error handling
// ------------------------------

app.notFound((c) => {
  return c.json({ message: "Not Found" }, 404);
});

export default handle(app);
