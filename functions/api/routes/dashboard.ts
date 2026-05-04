import { Hono } from "hono";
import { sql, eq, desc } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import { Bindings, Variables } from "../shared";

export const dashboardRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ── GET /dashboard/stats ────────────────────────────
// Returns real aggregated stats for the admin dashboard
dashboardRouter.get("/stats", async (c) => {
  const db = c.get("db");

  // Counts
  const [prodCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.products);
  const [catCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.categories);
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
  const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.orders);
  const [reviewCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.reviews);

  // Revenue
  const [revenueResult] = await db.select({
    total: sql<number>`COALESCE(SUM(total_amount), 0)`,
  }).from(schema.orders)
    .where(sql`lower(status) != 'cancelled'`);

  // Orders by status
  const statusRows = await db.select({
    status: schema.orders.status,
    count: sql<number>`count(*)`,
  }).from(schema.orders).groupBy(schema.orders.status);

  const ordersByStatus: Record<string, number> = {};
  statusRows.forEach((r) => { ordersByStatus[r.status || 'Unknown'] = r.count; });

  // Recent orders (last 5)
  const recentOrders = await db.select({
    id: schema.orders.id,
    invoiceId: schema.orders.invoiceId,
    customerName: schema.orders.customerName,
    status: schema.orders.status,
    totalAmount: schema.orders.totalAmount,
    createdAt: schema.orders.createdAt,
  }).from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(5);

  // Low stock products (stock < threshold or stock < 5)
  const lowStockProducts = await db.select({
    id: schema.products.id,
    title: schema.products.title,
    stock: schema.products.stock,
    lowStockThreshold: schema.products.lowStockThreshold,
  }).from(schema.products)
    .where(sql`stock < COALESCE(low_stock_threshold, 5) AND is_active = 1`)
    .limit(10);

  // Monthly revenue (last 6 months)
  const monthlyRevenue = await db.select({
    month: sql<string>`strftime('%Y-%m', datetime(created_at, 'unixepoch'))`,
    total: sql<number>`COALESCE(SUM(total_amount), 0)`,
    count: sql<number>`count(*)`,
  }).from(schema.orders)
    .where(sql`lower(status) != 'cancelled'`)
    .groupBy(sql`strftime('%Y-%m', datetime(created_at, 'unixepoch'))`)
    .orderBy(sql`strftime('%Y-%m', datetime(created_at, 'unixepoch')) DESC`)
    .limit(6);

  return c.json({
    counts: {
      products: prodCount.count,
      categories: catCount.count,
      users: userCount.count,
      orders: orderCount.count,
      reviews: reviewCount.count,
    },
    revenue: revenueResult.total,
    ordersByStatus,
    recentOrders,
    lowStockProducts,
    monthlyRevenue: monthlyRevenue.reverse(),
  });
});
