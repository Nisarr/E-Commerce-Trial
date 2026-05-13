// ═══════════════════════════════════════════════════════════════
// PlayPen House — Consolidated API (Modular Version)
// ═══════════════════════════════════════════════════════════════

import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { drizzle as drizzleLibSQL } from "drizzle-orm/libsql";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { createClient } from "@libsql/client";
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

app.use("*", cors());

// ─── SILENT HEALTH CHECK ───────────────────────────────────
// This must be BEFORE logger() and DB middleware to prevent 
// log spam and DB connection overhead during boot/polling.
app.on(["GET", "HEAD"], ["/api/health", "/api/v1/health"], (c) => {
  return c.json({ status: "ok", version: "v1.mod", time: new Date().toISOString() });
});

app.use("*", logger());

// DB Connection Middleware
app.use("*", async (c, next) => {
  // Skip DB for health checks
  if (c.req.path === "/api/health" || c.req.path === "/api/v1/health") {
    return await next();
  }

  try {
    // 1. Try Cloudflare D1 first (Native & Cloudflare Friendly)
    if (c.env.DB) {
      c.set("db", drizzleD1(c.env.DB, { schema }) as any);
      return await next();
    }

    // 2. Fallback to Turso/LibSQL
    const url = c.env.TURSO_URL;
    const authToken = c.env.TURSO_AUTH_TOKEN;

    if (url && authToken) {
      const client = createClient({ url, authToken });
      c.set("db", drizzleLibSQL(client, { schema }) as any);
      return await next();
    }

    console.error("No database connection configured (D1 or Turso)");
    await next();
  } catch (error: any) {
    console.error("DB Initialization Error:", error);
    await next();
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
    details: (c.env.NODE_ENV === 'development') ? err.message : undefined,
    timestamp: new Date().toISOString(),
    path: c.req.path
  }, 500);
});

// ─── V1 ROUTES ────────────────────────────────────────────

const v1 = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// API Security Middleware (for non-GET requests to protected paths)
v1.use("*", async (c, next) => {
  const method = c.req.method;
  const path = c.req.path;
  
  // 1. Skip GET/OPTIONS/HEAD (Publicly accessible or handled by CORS)
  if (['GET', 'OPTIONS', 'HEAD'].includes(method)) {
    return await next();
  }

  // 2. Define Public Routes (Methods that are non-GET but public)
  const publicPathPrefixes = [
    "/api/v1/auth",
    "/api/v1/orders",
    "/api/v1/reviews",
    "/api/v1/returns",
    "/api/v1/addresses",
    "/api/v1/users",
    "/api/v1/coupons/validate",
    "/api/v1/notifications"
  ];
  
  const isPublic = publicPathPrefixes.some(p => path.startsWith(p));
  if (isPublic) return await next();

  // 3. Security Check for Admin Operations
  const authHeader = c.req.header("Authorization");
  const apiKey = c.env.ADMIN_API_KEY;

  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    console.warn(`[Security] Unauthorized ${method} access to ${path}. Auth header: ${authHeader ? 'Present' : 'Missing'}`);
    return c.json({
      error: "Unauthorized",
      message: "Invalid or missing API key"
    }, 401);
  }
  
  await next();
});


// ─── Premium routes are now individually stubbed at router level ──
// No centralized premiumGuard needed — each router returns 403 for mutations.


// Mount Sub-routers
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
