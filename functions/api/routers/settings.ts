import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";
import { sendEmail } from "../utils/email";

export const settingsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

settingsRouter.get("/", async (c) => {
  const db = c.get("db");
  const rows = await db.select().from(schema.systemSettings);
  
  // Transform to a key-value object for easier frontend consumption
  const settings = rows.reduce((acc: any, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  return c.json(settings);
});

settingsRouter.post("/", async (c) => {
  return c.json({ error: "Premium feature. Source code removed in trial version." }, 403);
});

settingsRouter.post("/test-email", async (c) => {
  return c.json({ error: "Premium feature. Source code removed in trial version." }, 403);
});
