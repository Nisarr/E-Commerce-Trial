import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import { Bindings, Variables, formatLinks } from "../shared";

export const reviewsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ── GET /reviews?productId=xxx ──────────────────────
// Also supports ?userId=xxx for "My Reviews" page
reviewsRouter.get("/", async (c) => {
  const db = c.get("db");
  const productId = c.req.query("productId");
  const userId = c.req.query("userId");

  let whereClause;
  if (productId) {
    whereClause = (r: any, { eq }: any) => eq(r.productId, productId);
  } else if (userId) {
    whereClause = (r: any, { eq }: any) => eq(r.userId, userId);
  }

  const rows = await db.query.reviews.findMany({
    where: whereClause,
    orderBy: (r: any, { desc }: any) => [desc(r.createdAt)],
  });

  // Calculate aggregate stats if filtering by product
  let stats = null;
  if (productId && rows.length > 0) {
    const total = rows.length;
    const avgRating = rows.reduce((sum, r) => sum + r.rating, 0) / total;
    const distribution = [1, 2, 3, 4, 5].map(star => ({
      stars: star,
      count: rows.filter(r => r.rating === star).length,
      percentage: Math.round((rows.filter(r => r.rating === star).length / total) * 100),
    }));
    stats = { averageRating: Math.round(avgRating * 10) / 10, totalReviews: total, distribution };
  }

  return c.json({
    items: rows.map(r => ({ ...r, _links: formatLinks(c, "/reviews", r.id) })),
    stats,
    _links: formatLinks(c, "/reviews"),
  });
});

// ── POST /reviews ───────────────────────────────────
reviewsRouter.post("/", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.productId || !body?.userId || !body?.rating) {
    throw new Error("VAL: productId, userId, and rating are required.");
  }

  if (body.rating < 1 || body.rating > 5) {
    throw new Error("VAL: Rating must be between 1 and 5.");
  }

  // Check for duplicate review
  const existingReviews = await db.select().from(schema.reviews)
    .where(and(
      eq(schema.reviews.productId, body.productId),
      eq(schema.reviews.userId, body.userId)
    ));

  if (existingReviews.length > 0) {
    throw new Error("VAL: You have already reviewed this product.");
  }

  // Check if this is a verified purchase
  let isVerified = 0;
  try {
    const userOrders = await db.select().from(schema.orders)
      .where(eq(schema.orders.userId, body.userId));
    for (const order of userOrders) {
      if (order.status?.toLowerCase() === "delivered") {
        const items = await db.select().from(schema.orderItems)
          .where(and(
            eq(schema.orderItems.orderId, order.id),
            eq(schema.orderItems.productId, body.productId)
          ));
        if (items.length > 0) { isVerified = 1; break; }
      }
    }
  } catch { /* non-critical */ }

  const id = crypto.randomUUID();

  await db.insert(schema.reviews).values({
    id,
    productId: body.productId,
    userId: body.userId,
    username: body.username || "Anonymous",
    rating: body.rating,
    title: body.title || null,
    content: body.content || null,
    images: body.images ? JSON.stringify(body.images) : null,
    isVerified,
    createdAt: new Date(),
  });

  // Update product aggregate rating
  const allReviews = await db.select().from(schema.reviews)
    .where(eq(schema.reviews.productId, body.productId));
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await db.update(schema.products).set({
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: allReviews.length,
  }).where(eq(schema.products.id, body.productId));

  return c.json({
    id,
    isVerified,
    message: "Review submitted successfully",
    _links: formatLinks(c, "/reviews", id),
  }, 201);
});

// ── PATCH /reviews/:id ──────────────────────────────
reviewsRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();

  const [existing] = await db.select().from(schema.reviews).where(eq(schema.reviews.id, id));
  if (!existing) throw new Error(`Review with ID ${id} not found`);

  const updates: Record<string, any> = {};
  if (body.rating !== undefined) updates.rating = body.rating;
  if (body.title !== undefined) updates.title = body.title;
  if (body.content !== undefined) updates.content = body.content;
  if (body.images !== undefined) updates.images = JSON.stringify(body.images);
  if (body.status !== undefined) updates.status = body.status;

  if (Object.keys(updates).length > 0) {
    await db.update(schema.reviews).set(updates).where(eq(schema.reviews.id, id));
  }

  // Re-calculate product aggregate if rating changed
  if (body.rating !== undefined) {
    const allReviews = await db.select().from(schema.reviews)
      .where(eq(schema.reviews.productId, existing.productId));
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await db.update(schema.products).set({
      rating: Math.round(avgRating * 10) / 10,
    }).where(eq(schema.products.id, existing.productId));
  }

  return c.json({ message: "Review updated successfully", _links: formatLinks(c, "/reviews", id) });
});

// ── DELETE /reviews/:id ─────────────────────────────
reviewsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  const [existing] = await db.select().from(schema.reviews).where(eq(schema.reviews.id, id));
  if (!existing) throw new Error(`Review with ID ${id} not found`);

  await db.delete(schema.reviews).where(eq(schema.reviews.id, id));

  // Re-calculate product aggregate
  const remaining = await db.select().from(schema.reviews)
    .where(eq(schema.reviews.productId, existing.productId));
  const avgRating = remaining.length > 0
    ? remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length
    : 0;

  await db.update(schema.products).set({
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: remaining.length,
  }).where(eq(schema.products.id, existing.productId));

  return c.json({ message: "Review deleted successfully" });
});
