import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import * as schema from "../../server/db/schema";

import type { LibSQLDatabase } from "drizzle-orm/libsql";

type Bindings = {
  TURSO_URL: string;
  TURSO_AUTH_TOKEN: string;
  ADMIN_API_KEY: string;
};

type Variables = {
  db: LibSQLDatabase<typeof schema>;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>().basePath("/api");

app.use("*", logger());
app.use("*", cors());

// ─── AUTH MIDDLEWARE ──────────────────────────────────────
const authMiddleware = async (c: any, next: any) => {
  const method = c.req.method;
  const path = c.req.path;
  
  // Only protect destructive/admin routes
  const isPublic = method === 'GET' || path.includes('/health');
  if (isPublic) return await next();

  const authHeader = c.req.header("Authorization");
  const apiKey = c.env.ADMIN_API_KEY;

  if (!apiKey) {
    console.warn("ADMIN_API_KEY not set in environment.");
    return c.json({ error: "Authentication Configuration Error", message: "API security not configured" }, 500);
  }

  if (authHeader !== `Bearer ${apiKey}`) {
    return c.json({ error: "Unauthorized", message: "Invalid or missing API key" }, 401);
  }

  await next();
};

app.use("*", authMiddleware);

// ─── HEALTH CHECK (No DB needed) ──────────────────────────
app.get("/health", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// DB client per request (edge-safe)
app.use("*", async (c, next) => {
  try {
    const url = c.env.TURSO_URL;
    const authToken = c.env.TURSO_AUTH_TOKEN;

    if (!url || url.includes("your-db-url")) {
      console.warn("TURSO_URL is missing or using placeholder.");
      // We don't block next() here so /health works, 
      // but individual routes will check if db is set.
      return await next();
    }
    
    const client = createClient({
      url,
      authToken,
    });
    c.set("db", drizzle(client, { schema }));
    await next();
  } catch (error: any) {
    console.error("DB Initialization Error:", error);
    await next();
  }
});

// ─── ERROR HANDLING ───────────────────────────────────────
app.onError((err, c) => {
  console.error("Global API Error:", err);
  
  const isDbInitError = err.message.includes("Database client not initialized") || 
                        err.message.includes("TURSO_URL");
  
  // Check if it's a validation error (we'll throw these manually)
  if (err.message.startsWith("VALIDATION_ERROR:")) {
    return c.json({
      error: "Validation Error",
      message: err.message.replace("VALIDATION_ERROR:", "").trim()
    }, 422);
  }

  const statusCode = isDbInitError ? 503 : 500;
  
  return c.json({ 
    error: isDbInitError ? "Database Configuration Error" : "Internal Server Error", 
    message: isDbInitError ? "The server is not correctly connected to the database." : "An unexpected error occurred.",
    hint: isDbInitError ? "Please check your environment variables for TURSO_URL and TURSO_AUTH_TOKEN." : undefined,
    // Only show real error message in dev
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  }, statusCode);
});

// ─── BANNER ROUTES ───────────────────────────────────────
app.get("/banners", async (c) => {
  try {
    const position = c.req.query("position");
    const db = c.get("db");
    if (!db) return c.json([]); // Graceful fallback
    const rows = await db.query.banners.findMany({
      where: position
        ? (b: any, { eq }: any) => eq(b.position, position)
        : undefined,
      orderBy: (b: any, { asc }: any) => [asc(b.order)],
    });
    return c.json(rows);
  } catch (error: any) {
    console.error("Fetch banners error:", error);
    return c.json({ error: "Failed to fetch banners" }, 500);
  }
});

app.post("/banners", async (c) => {
  try {
    const db = c.get("db");
    if (!db) throw new Error("Database client not initialized");
    
    const body = await c.req.json().catch(() => null);
    if (!body) throw new Error("VALIDATION_ERROR: Missing or invalid JSON body");

    // Basic validation
    if (!body.image) throw new Error("VALIDATION_ERROR: Image URL is required");
    if (!body.position) throw new Error("VALIDATION_ERROR: Position is required");

    const id = crypto.randomUUID();
    
    await db.insert(schema.banners).values({
      id,
      image: body.image,
      link: body.link || null,
      position: body.position,
      order: Number(body.order) || 0,
      isActive: 1,
    });
    
    return c.json({ id, success: true }, 201);
  } catch (error: any) {
    // Re-throw validation errors to be caught by onError
    if (error.message.startsWith("VALIDATION_ERROR:")) throw error;
    
    console.error("Create banner error:", error);
    throw error; // Let global handler handle it
  }
});

app.put("/banners/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.get("db");
    if (!db) throw new Error("Database client not initialized");
    const body = await c.req.json();
    
    await db.update(schema.banners)
      .set({
        image: body.image,
        link: body.link,
        position: body.position,
        order: body.order,
      })
      .where(eq(schema.banners.id, id));
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Update banner error:", error);
    return c.json({ error: "Failed to update banner", details: error.message }, 500);
  }
});

app.delete("/banners/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.get("db");
    if (!db) throw new Error("Database client not initialized");
    
    await db.delete(schema.banners)
      .where(eq(schema.banners.id, id));
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Delete banner error:", error);
    return c.json({ error: "Failed to delete banner", details: error.message }, 500);
  }
});

// ─── CATEGORY ROUTES ─────────────────────────────────────
app.get("/categories", async (c) => {
  try {
    const db = c.get("db");
    if (!db) return c.json([]); // Graceful fallback
    const featured = c.req.query("featured");
    const rows = await db.query.categories.findMany({
      where: featured
        ? (cat: any, { eq }: any) => eq(cat.isFeatured, 1)
        : undefined,
    });
    return c.json(rows);
  } catch (error: any) {
    console.error("Fetch categories error:", error);
    return c.json({ error: "Failed to fetch categories", details: error.message }, 500);
  }
});

// ─── PRODUCT ROUTES ───────────────────────────────────────
app.get("/products", async (c) => {
  try {
    const db = c.get("db");
    if (!db) return c.json([]); // Graceful fallback
    const { sort, limit, category, tag } = c.req.query();
    
    // A simplified product fetch
    const limitNum = limit ? parseInt(limit) : 8;
    const rows = await db.query.products.findMany({
      limit: limitNum,
    });
    
    return c.json(rows);
  } catch (error: any) {
    console.error("Fetch products error:", error);
    return c.json({ error: "Failed to fetch products", details: error.message }, 500);
  }
});

app.get("/products/search", async (c) => {
  try {
    const q = c.req.query("q") ?? "";
    const db = c.get("db");
    if (!db) return c.json([]); // Graceful fallback
    const rows = await db.query.products.findMany({
      where: (p: any, { like }: any) => like(p.title, `%${q}%`),
      limit: 5,
    });
    return c.json(rows);
  } catch (error: any) {
    console.error("Search products error:", error);
    return c.json({ error: "Failed to search products", details: error.message }, 500);
  }
});

export const onRequest = handle(app);
