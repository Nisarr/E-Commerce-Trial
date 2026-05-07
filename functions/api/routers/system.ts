import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";

export const systemRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/**
 * 1. Force Update Global Home Cache
 * This uses the exact same logic as /api/v1/bulk/home but bypasses/updates the cache.
 */
systemRouter.post("/update-cache", async (c) => {
  const db = c.get("db");
  
  try {
    // 1. Fetch fresh data (same logic as bulkRouter.get("/home"))
    const [banners, categories, newProducts, popularProducts, bestSelling, [popup]] = await Promise.all([
      db.select().from(schema.banners).where(eq(schema.banners.isActive, 1)),
      db.select().from(schema.categories).where(eq(schema.categories.isActive, 1)),
      db.query.products.findMany({ 
        where: (p, { eq }) => eq(p.isActive, 1),
        limit: 8, 
        orderBy: (p, { desc }) => [desc(p.createdAt)] 
      }),
      db.query.products.findMany({ 
        where: (p, { eq }) => eq(p.isActive, 1),
        limit: 8, 
        orderBy: (p, { desc }) => [desc(p.rating)] 
      }),
      db.query.products.findMany({ 
        where: (p, { eq }) => eq(p.isActive, 1),
        limit: 8, 
        orderBy: (p, { desc }) => [desc(p.soldCount)] 
      }),
      db.select().from(schema.popupSettings).where(eq(schema.popupSettings.isActive, 1)).limit(1)
    ]);

    // 2. Transform data to match frontend HomeBulkResponse structure
    const structuredData = {
      banners: {
        hero: banners.filter(b => b.position === 'hero').sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        mid1: banners.filter(b => b.position === 'mid-1').sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        mid2: banners.filter(b => b.position === 'mid-2').sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      },
      categories: { items: categories },
      products: {
        trending: { items: popularProducts },
        newArrivals: { items: newProducts },
        specialOffers: { items: newProducts.filter(p => p.salePrice !== null) },
        bestSelling: { items: bestSelling },
        flashSales: { items: [] }, 
      },
      popup: popup || null,
      notifications: { items: [] }, 
      timestamp: new Date().toISOString()
    };

    // 3. Save to Cache Table
    await db.insert(schema.systemCache).values({
      key: "home_bulk",
      data: JSON.stringify(structuredData),
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: schema.systemCache.key,
      set: { 
        data: JSON.stringify(structuredData), 
        updatedAt: new Date() 
      }
    });

    return c.json({ 
      success: true, 
      message: "System cache updated successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Cache Refresh Error:", error);
    return c.json({ error: "Failed to update system cache", details: error.message }, 500);
  }
});

// Alias for backward compatibility if any
systemRouter.post("/refresh-cache", (c) => c.redirect("/api/v1/system/update-cache", 307));

/**
 * 2. Get Cache Status
 */
systemRouter.get("/cache-status", async (c) => {
  const db = c.get("db");
  try {
    const cache = await db.select().from(schema.systemCache);
    return c.json(cache);
  } catch (error: any) {
    return c.json({ error: "Failed to fetch cache status" }, 500);
  }
});
