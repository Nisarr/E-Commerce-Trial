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
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { addressesRouter } from "./routes/addresses";
import { reviewsRouter } from "./routes/reviews";
import { returnsRouter } from "./routes/returns";
import { settingsRouter } from "./routes/settings";
import { couponsRouter } from "./routes/coupons";
import { dashboardRouter } from "./routes/dashboard";
import { walletRouter } from "./routes/wallet";
import { notificationsRouter } from "./routes/notifications";

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
// Customer-facing endpoints (auth, orders, reviews, returns, addresses) are exempt
// from admin API key requirement for write operations.
v1.use("*", async (c, next) => {
  const method = c.req.method;
  if (method === 'GET') return await next();

  // Public write routes that customers can access without admin API key
  const path = c.req.path;
  const publicPaths = ["/api/v1/auth/", "/api/v1/orders", "/api/v1/reviews", "/api/v1/returns", "/api/v1/addresses", "/api/v1/users/"];
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

// Mount Routes — Admin
v1.route("/banners", bannersRouter);
v1.route("/categories", categoriesRouter);
v1.route("/products", productsRouter);
v1.route("/orders", ordersRouter);

// Mount Routes — Customer
v1.route("/auth", authRouter);
v1.route("/users", usersRouter);
v1.route("/addresses", addressesRouter);
v1.route("/reviews", reviewsRouter);
v1.route("/returns", returnsRouter);
v1.route("/settings", settingsRouter);
v1.route("/coupons", couponsRouter);
v1.route("/dashboard", dashboardRouter);
v1.route("/wallet", walletRouter);
v1.route("/notifications", notificationsRouter);

app.route("/api/v1", v1);

export const onRequest = handle(app);


