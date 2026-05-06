import { Hono } from "hono";
import { eq, and, desc, isNull } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";

export const bulkRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/**
 * Consolidates all user-related data for the dashboard/account view into a single request.
 * This replaces up to 10+ separate API calls.
 */
bulkRouter.get("/user", async (c) => {
  const db = c.get("db");
  const userId = c.req.query("userId");
  const customerName = c.req.query("customerName");
  const email = c.req.query("email");

  if (!userId) {
    return c.json({ error: "userId query parameter is required" }, 400);
  }

  try {
    const [
      userProfile,
      walletTransactions,
      addresses,
      orders,
      returns,
      cancellations,
      reviews,
      notificationCount
    ] = await Promise.all([
      // 1. User Profile
      db.query.users.findFirst({
        where: (u: any, { eq }: any) => eq(u.id, userId)
      }),
      // 2. Wallet Transactions & Balance
      db.query.walletTransactions.findMany({
        where: (t: any, { eq }: any) => eq(t.userId, userId),
        orderBy: (t: any, { desc }: any) => [desc(t.createdAt)]
      }),
      // 3. Addresses
      db.query.addresses.findMany({
        where: (a: any, { eq }: any) => eq(a.userId, userId),
        orderBy: (a: any, { desc }: any) => [desc(a.createdAt)]
      }),
      // 4. Orders (Unified query for registered & guest checkouts)
      db.query.orders.findMany({
        where: (o: any, { eq, or }: any) => {
          const conds = [];
          if (userId && userId.trim() !== "") conds.push(eq(o.userId, userId));
          if (customerName && customerName.trim() !== "") conds.push(eq(o.customerName, customerName));
          if (email && email.trim() !== "") conds.push(eq(o.customerEmail, email));
          return conds.length > 0 ? or(...conds) : undefined;
        },
        with: {
          items: true
        },
        orderBy: (o: any, { desc }: any) => [desc(o.createdAt)]
      }),
      // 5. Returns
      db.query.returns.findMany({
        where: (r: any, { eq, and }: any) => and(eq(r.userId, userId), eq(r.type, 'return')),
        orderBy: (r: any, { desc }: any) => [desc(r.createdAt)]
      }),
      // 6. Cancellations
      db.query.returns.findMany({
        where: (r: any, { eq, and }: any) => and(eq(r.userId, userId), eq(r.type, 'cancellation')),
        orderBy: (r: any, { desc }: any) => [desc(r.createdAt)]
      }),
      // 7. Reviews
      db.query.reviews.findMany({
        where: (r: any, { eq }: any) => eq(r.userId, userId),
        orderBy: (r: any, { desc }: any) => [desc(r.createdAt)]
      }),
      // 8. Unread Notifications Count
      db.query.notifications.findMany({
        where: (n: any, { eq, and, or, isNull }: any) => and(
          eq(n.isRead, 0),
          or(eq(n.userId, userId), isNull(n.userId))
        )
      })
    ]);

    return c.json({
      profile: userProfile || null,
      wallet: {
        balance: walletTransactions.length > 0 ? (walletTransactions[0].balanceAfter ?? 0) : 0,
        transactions: walletTransactions
      },
      addresses: { items: addresses },
      orders: { items: orders },
      returns: { items: returns },
      cancellations: { items: cancellations },
      reviews: { items: reviews },
      notifications: { 
        unreadCount: notificationCount.length,
        latest: notificationCount.slice(0, 5)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Bulk user fetch error:", error.message);
    return c.json({ error: "Bulk user fetch failed", details: error.message }, 500);
  }
});

bulkRouter.get("/home", async (c) => {
  const db = c.get("db");

  try {
    // 1. Check Cache First
    const [cached] = await db.select().from(schema.systemCache).where(eq(schema.systemCache.key, "home_bulk"));
    
    const now = new Date();
    const isStale = cached && new Date(cached.updatedAt).toDateString() !== now.toDateString();

    if (cached && !isStale) {
      return c.json({
        ...JSON.parse(cached.data),
        _cached: true,
        _updatedAt: cached.updatedAt
      });
    }

    // 2. Fetch fresh data (if no cache or stale)
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

    // 3. Transform data to match frontend HomeBulkResponse structure
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
        flashSales: { items: [] }, // Placeholder or fetch if needed
      },
      popup: popup || null,
      notifications: { items: [] }, // Placeholder
      timestamp: new Date().toISOString()
    };

    // 4. Auto-cache for next time
    await db.insert(schema.systemCache).values({
      key: "home_bulk",
      data: JSON.stringify(structuredData),
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: schema.systemCache.key,
      set: { data: JSON.stringify(structuredData), updatedAt: new Date() }
    });

    return c.json({ ...structuredData, _cached: false });
  } catch (error: any) {
    console.error("Home bulk fetch error:", error);
    return c.json({ error: "Home bulk fetch failed", details: error.message }, 500);
  }
});
