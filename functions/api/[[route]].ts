import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { eq, sql, count } from "drizzle-orm";
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

// ─── HELPERS ──────────────────────────────────────────────

const formatLinks = (c: any, path: string, id?: string) => {
  const baseUrl = new URL(c.req.url).origin + "/api/v1";
  const self = id ? `${baseUrl}${path}/${id}` : `${baseUrl}${path}`;
  return {
    self,
    collection: id ? `${baseUrl}${path}` : undefined,
  };
};

const createPaginatedResponse = (
  items: any[],
  total: number,
  page: number,
  limit: number,
  links: any
) => {
  const pages = Math.ceil(total / limit);
  return {
    items,
    pagination: {
      total,
      page,
      limit,
      pages,
      has_next: page < pages,
      has_prev: page > 1,
    },
    _links: links,
  };
};

// ─── API APP ──────────────────────────────────────────────

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", logger());
app.use("*", cors());

// DB Middleware
app.use("*", async (c, next) => {
  const url = c.env.TURSO_URL;
  const authToken = c.env.TURSO_AUTH_TOKEN;

  if (!url || url.includes("your-db-url")) {
    // If it's a health check, we don't need DB
    if (c.req.path === "/api/health" || c.req.path === "/api/v1/health") {
      return await next();
    }
    return c.json({ 
      error: "Database Configuration Error", 
      message: "TURSO_URL is missing or using placeholder." 
    }, 503);
  }

  try {
    const client = createClient({ url, authToken });
    c.set("db", drizzle(client, { schema }));
    await next();
  } catch (error: any) {
    console.error("DB Connection Error:", error);
    return c.json({ 
      error: "Service Unavailable", 
      message: "Could not connect to the database." 
    }, 503);
  }
});

// Error Handling
app.onError((err, c) => {
  console.error("API Error:", err);
  
  if (err.message.startsWith("VAL:")) {
    return c.json({
      error: "ValidationError",
      message: err.message.replace("VAL:", "").trim(),
      timestamp: new Date().toISOString(),
      path: c.req.path
    }, 422);
  }

  if (err.message.includes("not found")) {
    return c.json({
      error: "NotFound",
      message: err.message,
      timestamp: new Date().toISOString(),
      path: c.req.path
    }, 404);
  }

  return c.json({
    error: "InternalServerError",
    message: "An unexpected error occurred.",
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString(),
    path: c.req.path
  }, 500);
});

// ─── HEALTH CHECK ─────────────────────────────────────────
app.get("/api/health", (c) => c.json({ status: "ok", version: "v1" }));

// ─── V1 ROUTES ────────────────────────────────────────────
const v1 = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Auth Middleware for V1 (Destructive operations only)
v1.use("*", async (c, next) => {
  const method = c.req.method;
  if (method === 'GET') return await next();

  const authHeader = c.req.header("Authorization");
  const apiKey = c.env.ADMIN_API_KEY;

  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return c.json({ 
      error: "Unauthorized", 
      message: "Invalid or missing API key" 
    }, 401);
  }
  await next();
});

// ─── BANNER ROUTES ────────────────────────────────────────
v1.get("/banners", async (c) => {
  try {
    const position = c.req.query("position");
    const db = c.get("db");
    
    const rows = await db.query.banners.findMany({
      where: position ? (b: any, { eq }: any) => eq(b.position, position) : undefined,
      orderBy: (b: any, { asc }: any) => [asc(b.order)],
    });

    return c.json({
      items: rows.map(r => ({
        ...r,
        _links: formatLinks(c, "/banners", r.id)
      })),
      _links: formatLinks(c, "/banners")
    });
  } catch (error: any) {
    console.error("Fetch banners error:", error.message);
    return c.json({ items: [], _links: formatLinks(c, "/banners") });
  }
});

v1.post("/banners", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);
  
  if (!body?.image || !body?.position) {
    throw new Error("VAL: Image and position are required fields.");
  }

  const id = crypto.randomUUID();
  await db.insert(schema.banners).values({
    id,
    image: body.image,
    link: body.link || null,
    position: body.position,
    order: Number(body.order) || 0,
    isActive: 1,
  });

  return c.json({ 
    id, 
    message: "Banner created successfully",
    _links: formatLinks(c, "/banners", id)
  }, 201);
});

v1.patch("/banners/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();
  
  const [existing] = await db.select().from(schema.banners).where(eq(schema.banners.id, id));
  if (!existing) throw new Error(`Banner with ID ${id} not found`);

  await db.update(schema.banners)
    .set({
      image: body.image ?? existing.image,
      link: body.link ?? existing.link,
      position: body.position ?? existing.position,
      order: body.order !== undefined ? Number(body.order) : existing.order,
      isActive: body.isActive !== undefined ? (body.isActive ? 1 : 0) : existing.isActive,
    })
    .where(eq(schema.banners.id, id));

  return c.json({ 
    message: "Banner updated successfully",
    _links: formatLinks(c, "/banners", id)
  });
});

v1.delete("/banners/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  
  const result = await db.delete(schema.banners).where(eq(schema.banners.id, id));
  return c.body(null, 204);
});

// ─── CATEGORY ROUTES ──────────────────────────────────────
v1.get("/categories", async (c) => {
  try {
    const db = c.get("db");
    const featured = c.req.query("featured") === "true";
    
    const rows = await db.query.categories.findMany({
      where: featured ? (cat: any, { eq }: any) => eq(cat.isFeatured, 1) : undefined,
    });

    return c.json({
      items: rows.map(r => ({
        ...r,
        _links: formatLinks(c, "/categories", r.id)
      })),
      _links: formatLinks(c, "/categories")
    });
  } catch (error: any) {
    console.error("Fetch categories error:", error.message);
    return c.json({ items: [], _links: formatLinks(c, "/categories") });
  }
});

// ─── PRODUCT ROUTES ───────────────────────────────────────
v1.get("/products", async (c) => {
  try {
    const db = c.get("db");
    const page = Math.max(1, Number(c.req.query("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(c.req.query("limit") || 12)));
    const offset = (page - 1) * limit;
    
    const { category, tag, sort } = c.req.query();
    
    // Base query
    let whereClause = undefined;
    if (category) {
      whereClause = eq(schema.products.categoryId, category);
    }
    
    const [totalRes] = await db.select({ count: count() }).from(schema.products);
    const total = totalRes.count;

    const rows = await db.query.products.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (p: any, { desc, asc }: any) => {
        if (sort === "newest") return [desc(p.createdAt)];
        if (sort === "price-low") return [asc(p.price)];
        if (sort === "price-high") return [desc(p.price)];
        return [desc(p.rating)]; // trending/default
      }
    });

    return c.json(createPaginatedResponse(
      rows.map(r => ({ ...r, _links: formatLinks(c, "/products", r.id) })),
      total,
      page,
      limit,
      formatLinks(c, "/products")
    ));
  } catch (error: any) {
    console.error("Fetch products error:", error.message);
    return c.json(createPaginatedResponse([], 0, 1, 12, formatLinks(c, "/products")));
  }
});

v1.get("/products/search", async (c) => {
  try {
    const q = c.req.query("q") ?? "";
    const db = c.get("db");
    
    const rows = await db.query.products.findMany({
      where: (p: any, { like, or }: any) => or(
        like(p.title, `%${q}%`),
        like(p.brand, `%${q}%`)
      ),
      limit: 10,
    });

    return c.json({
      items: rows.map(r => ({ ...r, _links: formatLinks(c, "/products", r.id) })),
      query: q,
      _links: formatLinks(c, "/products/search")
    });
  } catch (error: any) {
    console.error("Search products error:", error.message);
    return c.json({ items: [], query: c.req.query("q") ?? "", _links: formatLinks(c, "/products/search") });
  }
});

v1.get("/products/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  
  const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id));
  if (!product) throw new Error(`Product with ID ${id} not found`);

  return c.json({
    ...product,
    _links: formatLinks(c, "/products", id)
  });
});

v1.post("/products", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);
  
  if (!body?.title || !body?.price) {
    throw new Error("VAL: Title and price are required fields.");
  }

  const id = crypto.randomUUID();
  const slug = body.title.toLowerCase().replace(/ /g, "-") + "-" + id.slice(0, 5);
  
  await db.insert(schema.products).values({
    id,
    title: body.title,
    slug: body.slug || slug,
    categoryId: body.categoryId || null,
    brand: body.brand || "Generic",
    price: Number(body.price),
    salePrice: body.salePrice ? Number(body.salePrice) : null,
    stock: Number(body.stock) || 0,
    images: body.images ? JSON.stringify(body.images) : "[]",
    tags: body.tags ? JSON.stringify(body.tags) : "[]",
    rating: 0,
    reviewCount: 0,
    isActive: 1,
    createdAt: new Date(),
  });

  return c.json({ 
    id, 
    message: "Product created successfully",
    _links: formatLinks(c, "/products", id)
  }, 201);
});

v1.patch("/products/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();
  
  const [existing] = await db.select().from(schema.products).where(eq(schema.products.id, id));
  if (!existing) throw new Error(`Product with ID ${id} not found`);

  await db.update(schema.products)
    .set({
      title: body.title ?? existing.title,
      slug: body.slug ?? existing.slug,
      categoryId: body.categoryId ?? existing.categoryId,
      brand: body.brand ?? existing.brand,
      price: body.price !== undefined ? Number(body.price) : existing.price,
      salePrice: body.salePrice !== undefined ? (body.salePrice ? Number(body.salePrice) : null) : existing.salePrice,
      stock: body.stock !== undefined ? Number(body.stock) : existing.stock,
      images: body.images ? JSON.stringify(body.images) : existing.images,
      tags: body.tags ? JSON.stringify(body.tags) : existing.tags,
      isActive: body.isActive !== undefined ? (body.isActive ? 1 : 0) : existing.isActive,
    })
    .where(eq(schema.products.id, id));

  return c.json({ 
    message: "Product updated successfully",
    _links: formatLinks(c, "/products", id)
  });
});

v1.delete("/products/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  
  await db.delete(schema.products).where(eq(schema.products.id, id));
  return c.body(null, 204);
});

app.route("/api/v1", v1);

export const onRequest = handle(app);

