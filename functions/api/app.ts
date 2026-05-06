// ═══════════════════════════════════════════════════════════════
// PlayPen House — Consolidated API (Modular Version)
// ═══════════════════════════════════════════════════════════════

import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../../backend/server/db/schema";

// Types
import type { Bindings, Variables } from "./types";

// Routers
import { authRouter } from "./routers/auth";
import { usersRouter } from "./routers/users";
import { productsRouter } from "./routers/products";
import { categoriesRouter } from "./routers/categories";
import { bannersRouter } from "./routers/banners";
import { ordersRouter } from "./routers/orders";
import { addressesRouter } from "./routers/addresses";
import { reviewsRouter } from "./routers/reviews";
import { returnsRouter } from "./routers/returns";
import { settingsRouter } from "./routers/settings";
import { couponsRouter } from "./routers/coupons";
import { dashboardRouter } from "./routers/dashboard";
import { walletRouter } from "./routers/wallet";
import { notificationsRouter } from "./routers/notifications";
import { bulkRouter } from "./routers/bulk";
import { systemRouter } from "./routers/system";
import { popupRouter } from "./routers/popup";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ─── MIDDLEWARE ───────────────────────────────────────────

app.use("*", logger());
app.use("*", cors());

// ─── HEALTH CHECK (Before DB Middleware to ensure responsiveness) ───────
app.get("/api/health", (c) => c.json({ status: "ok", version: "v1.mod" }));
app.get("/api/v1/health", (c) => c.json({ status: "ok", version: "v1.mod" }));

// DB Connection Middleware
app.use("*", async (c, next) => {
  // Skip DB for health checks
  if (c.req.path === "/api/health" || c.req.path === "/api/v1/health") {
    return await next();
  }

  const url = c.env.TURSO_URL;
  const authToken = c.env.TURSO_AUTH_TOKEN;

  if (!url || url.includes("your-db-url")) {
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

// Global Error Handler
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

// ─── V1 ROUTES ────────────────────────────────────────────

const v1 = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// API Security Middleware (for non-GET requests to protected paths)
v1.use("*", async (c, next) => {
  const method = c.req.method;
  if (method === 'GET') return await next();

  const path = c.req.path;
  const publicPaths = [
    "/api/v1/auth/", 
    "/api/v1/orders", 
    "/api/v1/reviews", 
    "/api/v1/returns", 
    "/api/v1/addresses", 
    "/api/v1/users/", 
    "/api/v1/coupons/validate",
    "/api/v1/notifications"
  ];
  
  const isPublic = publicPaths.some(p => path.startsWith(p));
  if (isPublic) return await next();

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

// Mount Sub-routers
v1.route("/", systemRouter);
v1.route("/auth", authRouter);
v1.route("/users", usersRouter);
v1.route("/products", productsRouter);
v1.route("/categories", categoriesRouter);
v1.route("/banners", bannersRouter);
v1.route("/orders", ordersRouter);
v1.route("/addresses", addressesRouter);
v1.route("/reviews", reviewsRouter);
v1.route("/returns", returnsRouter);
v1.route("/settings", settingsRouter);
v1.route("/coupons", couponsRouter);
v1.route("/dashboard", dashboardRouter);
v1.route("/wallet", walletRouter);
v1.route("/notifications", notificationsRouter);
v1.route("/bulk", bulkRouter);
v1.route("/popup", popupRouter);
v1.route("/system", systemRouter);

app.route("/api/v1", v1);

export const onRequest = handle(app);
