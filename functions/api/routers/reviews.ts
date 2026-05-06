import { Hono } from "hono";
import { eq, desc, and, not, isNull } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";
import { formatLinks } from "../utils/helpers";

export const reviewsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

reviewsRouter.get("/", async (c) => {
  const db = c.get("db");
  const productId = c.req.query("productId");
  const userId = c.req.query("userId");
  const sort = c.req.query("sort");
  const hasImages = c.req.query("hasImages") === "true";
  const conds = [];
  if (productId) conds.push(eq(schema.reviews.productId, productId));
  if (userId) conds.push(eq(schema.reviews.userId, userId));
  if (productId && !userId) conds.push(eq(schema.reviews.status, "approved"));
  
  if (hasImages) {
    conds.push(not(isNull(schema.reviews.images)));
    conds.push(not(eq(schema.reviews.images, "[]")));
  }

  const rows = await db.select({
    id: schema.reviews.id,
    productId: schema.reviews.productId,
    userId: schema.reviews.userId,
    username: schema.reviews.username,
    rating: schema.reviews.rating,
    title: schema.reviews.title,
    content: schema.reviews.content,
    images: schema.reviews.images,
    isVerified: schema.reviews.isVerified,
    helpfulCount: schema.reviews.helpfulCount,
    status: schema.reviews.status,
    createdAt: schema.reviews.createdAt,
    productName: schema.products.title,
  })
  .from(schema.reviews)
  .leftJoin(schema.products, eq(schema.reviews.productId, schema.products.id))
  .where(conds.length > 0 ? and(...conds) : undefined)
  .orderBy(sort === "helpful" ? desc(schema.reviews.helpfulCount) : desc(schema.reviews.createdAt));

  // Calculate aggregate stats if filtering by product
  let stats = null;
  if (productId) {
    const allApproved = await db.select().from(schema.reviews)
      .where(and(eq(schema.reviews.productId, productId), eq(schema.reviews.status, "approved")));
    
    if (allApproved.length > 0) {
      const total = allApproved.length;
      const avgRating = allApproved.reduce((sum: number, r: any) => sum + r.rating, 0) / total;
      const distribution = [1, 2, 3, 4, 5].map(star => ({
        stars: star,
        count: allApproved.filter(r => r.rating === star).length,
        percentage: Math.round((allApproved.filter(r => r.rating === star).length / total) * 100),
      }));
      stats = { averageRating: Math.round(avgRating * 10) / 10, totalReviews: total, distribution };
    } else {
      stats = { averageRating: 0, totalReviews: 0, distribution: [1,2,3,4,5].map(s => ({ stars: s, count: 0, percentage: 0 })) };
    }
  }

  return c.json({
    items: rows.map((r: any) => ({ ...r, _links: formatLinks(c, "/reviews", r.id) })),
    stats,
    _links: formatLinks(c, "/reviews"),
  });
});

reviewsRouter.post("/", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.productId || !body?.userId || !body?.rating) {
    throw new Error("VAL: productId, userId, and rating are required.");
  }

  if (body.rating < 1 || body.rating > 5) {
    throw new Error("VAL: Rating must be between 1 and 5.");
  }

  // Fetch username if not provided (required by schema)
  let username = body.username;
  if (!username) {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, body.userId));
    username = user?.username || "Guest";
  }

  const id = crypto.randomUUID();
  await db.insert(schema.reviews).values({
    id,
    productId: body.productId,
    userId: body.userId,
    username,
    rating: body.rating,
    content: body.comment || null,
    images: body.images ? (typeof body.images === 'string' ? body.images : JSON.stringify(body.images)) : "[]",
    status: "pending", // All new reviews require approval
    createdAt: new Date(),
  });

  return c.json({
    id,
    message: "Review submitted successfully and is awaiting approval.",
    _links: formatLinks(c, "/reviews", id),
  }, 201);
});

reviewsRouter.patch("/:id/status", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();

  if (!body?.status) throw new Error("VAL: Status is required.");

  const [review] = await db.select().from(schema.reviews).where(eq(schema.reviews.id, id));
  if (!review) throw new Error(`Review with ID ${id} not found`);

  await db.update(schema.reviews).set({ status: body.status }).where(eq(schema.reviews.id, id));

  // If status changed to approved, or if it was approved and now it's not, we should technically recalculate product aggregate rating
  // But our sync script or aggregate logic in GET /reviews handles it for now.
  // Real-time update for product aggregate:
  if (body.status === "approved" || review.status === "approved") {
    const productId = review.productId;
    const allApproved = await db.select().from(schema.reviews)
      .where(and(eq(schema.reviews.productId, productId), eq(schema.reviews.status, "approved")));
    
    const countVal = allApproved.length;
    const avgVal = countVal > 0 ? allApproved.reduce((s, r) => s + r.rating, 0) / countVal : 0;

    await db.update(schema.products).set({
      rating: Number(avgVal.toFixed(1)),
      reviewCount: countVal
    }).where(eq(schema.products.id, productId));
  }

  return c.json({ message: "Review status updated successfully." });
});

reviewsRouter.patch("/:id/helpful", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  const [review] = await db.select().from(schema.reviews).where(eq(schema.reviews.id, id));
  if (!review) throw new Error(`Review with ID ${id} not found`);

  await db.update(schema.reviews)
    .set({ helpfulCount: (review.helpfulCount || 0) + 1 })
    .where(eq(schema.reviews.id, id));

  return c.json({ message: "Review marked as helpful." });
});

reviewsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  const [review] = await db.select().from(schema.reviews).where(eq(schema.reviews.id, id));
  if (!review) throw new Error(`Review with ID ${id} not found`);

  await db.delete(schema.reviews).where(eq(schema.reviews.id, id));

  // Recalculate product aggregate if deleted review was approved
  if (review.status === "approved") {
    const productId = review.productId;
    const allApproved = await db.select().from(schema.reviews)
      .where(and(eq(schema.reviews.productId, productId), eq(schema.reviews.status, "approved")));
    
    const countVal = allApproved.length;
    const avgVal = countVal > 0 ? allApproved.reduce((s, r) => s + r.rating, 0) / countVal : 0;

    await db.update(schema.products).set({
      rating: Number(avgVal.toFixed(1)),
      reviewCount: countVal
    }).where(eq(schema.products.id, productId));
  }

  return c.json({ message: "Review deleted successfully" });
});
