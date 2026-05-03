import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../../backend/server/db/schema";
import { Bindings, Variables } from "./shared";

import { bannersRouter } from "./routes/banners";
import { categoriesRouter } from "./routes/categories";
import { productsRouter } from "./routes/products";
import { ordersRouter } from "./routes/orders";

// ─── API APP ──────────────────────────────────────────────

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", logger());
app.use("*", cors());

// DB Middleware
app.use("*", async (c, next) => {
  const url = c.env.TURSO_URL;
  const authToken = c.env.TURSO_AUTH_TOKEN;

  if (!url || url.includes("your-db-url")) {
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

// Mount Routes
v1.route("/banners", bannersRouter);
v1.route("/categories", categoriesRouter);
v1.route("/products", productsRouter);
v1.route("/orders", ordersRouter);

app.route("/api/v1", v1);

export const onRequest = handle(app);


