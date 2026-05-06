
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";

export const systemRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 1. Refresh Global Cache
systemRouter.post("/refresh-cache", async (c) => {
  const db = c.get("db");
  
  try {
    // 1. Fetch Home Data (Banners, Popular, New, Categories)
    const [banners, categories, newProducts, popularProducts] = await Promise.all([
      db.select().from(schema.banners).where(eq(schema.banners.isActive, 1)),
      db.select().from(schema.categories),
      db.query.products.findMany({ limit: 8, orderBy: (p, { desc }) => [desc(p.createdAt)] }),
      db.query.products.findMany({ limit: 8, orderBy: (p, { desc }) => [desc(p.soldCount)] }),
    ]);

    const homeData = { banners, categories, newProducts, popularProducts };

    // 2. Save to Cache Table
    await db.insert(schema.systemCache).values({
      key: "home_bulk",
      data: JSON.stringify(homeData),
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: schema.systemCache.key,
      set: { data: JSON.stringify(homeData), updatedAt: new Date() }
    });

    return c.json({ success: true, message: "Cache updated successfully" });
  } catch (error: any) {
    console.error("Cache Refresh Error:", error);
    return c.json({ error: "Failed to refresh cache" }, 500);
  }
});

// 2. Get Cache Status
systemRouter.get("/cache-status", async (c) => {
  const db = c.get("db");
  const cache = await db.select().from(schema.systemCache);
  return c.json(cache);
});
