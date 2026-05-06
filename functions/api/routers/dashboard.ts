import { Hono } from "hono";
import { sql } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";

export const dashboardRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

dashboardRouter.get("/stats", async (c) => {
  const db = c.get("db");

  // Counts
  const [prodCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.products);
  const [catCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.categories);
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
  const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.orders);
  
  // Pending Verifications (OTP codes with metadata that aren't used/expired)
  const [pendingCount] = await db.select({ count: sql<number>`count(*)` })
    .from(schema.otpCodes)
    .where(sql`type = 'email_verify' AND used = 0 AND expires_at > ${Date.now()}`);

  // Revenue
  const [totalRevenue] = await db.select({ total: sql<number>`sum(total_amount)` }).from(schema.orders);

  // Growth (This would normally be compared with last month, using placeholder logic for now)
  const growth = {
    revenue: "+12.5%",
    users: "+8.2%",
    orders: "+15.0%",
  };

  return c.json({
    counts: {
      products: prodCount?.count || 0,
      categories: catCount?.count || 0,
      users: userCount?.count || 0,
      pendingUsers: pendingCount?.count || 0,
      orders: orderCount?.count || 0,
    },
    revenue: {
      total: totalRevenue?.total || 0,
      currency: "BDT",
    },
    growth,
    timestamp: new Date().toISOString(),
  });
});
