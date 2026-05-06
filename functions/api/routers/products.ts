import { Hono } from "hono";
// Product router handling all product related operations
import { eq, count, like, or, and, isNotNull, not, desc } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";
import { formatLinks, createPaginatedResponse, invalidateHomeCache } from "../utils/helpers";

export const productsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

productsRouter.get("/", async (c) => {
  try {
    const db = c.get("db");
    const page = Math.max(1, Number(c.req.query("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(c.req.query("limit") || 12)));
    const offset = (page - 1) * limit;

    const { category, tag, sort, q, hasOffer } = c.req.query();

    // Base query
    let conditions = [];
    if (category) {
      conditions.push(eq(schema.products.categoryId, category));
    }
    if (q) {
      conditions.push(
        or(
          like(schema.products.title, `%${q}%`),
          like(schema.products.brand, `%${q}%`)
        )
      );
    }
    if (tag) {
      conditions.push(like(schema.products.tags, `%"${tag}"%`));
    }
    if (hasOffer === 'true') {
      conditions.push(isNotNull(schema.products.salePrice));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRes] = await db.select({ count: count() }).from(schema.products).where(whereClause);
    const total = totalRes.count;

    const rows = await db.query.products.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (p: any, { desc, asc }: any) => {
        if (sort === "newest") return [desc(p.createdAt)];
        if (sort === "price-low") return [asc(p.price)];
        if (sort === "price-high") return [desc(p.price)];
        if (sort === "best-selling") return [desc(p.soldCount)];
        if (sort === "trending") return [desc(p.rating)];
        return [desc(p.createdAt)]; // default to newest
      }
    });

    return c.json(createPaginatedResponse(
      rows.map((r: any) => ({ ...r, _links: formatLinks(c, "/products", r.id) })),
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

productsRouter.get("/search", async (c) => {
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
      items: rows.map((r: any) => ({ ...r, _links: formatLinks(c, "/products", r.id) })),
      query: q,
      _links: formatLinks(c, "/products/search")
    });
  } catch (error: any) {
    console.error("Search products error:", error.message);
    return c.json({ items: [], query: c.req.query("q") ?? "", _links: formatLinks(c, "/products/search") });
  }
});

productsRouter.get("/by-slug/:slug/bulk", async (c) => {
  try {
    const slug = c.req.param("slug");
    const recentlyViewedIds = (c.req.query("recentlyViewed") || "").split(",").filter(Boolean);
    const db = c.get("db");

    // 1. Get Main Product
    const [product] = await db.select().from(schema.products).where(eq(schema.products.slug, slug));
    if (!product) return c.json({ error: "Product not found" }, 404);

    const productTags = JSON.parse(product.tags || "[]");

    // 2. Get Potential Candidates for Suggestions
    // We fetch more than we need (e.g., 20) and then score them in memory
    const candidates = await db.query.products.findMany({
      where: and(
        not(eq(schema.products.id, product.id)),
        or(
          ...(product.categoryId ? [eq(schema.products.categoryId, product.categoryId)] : []),
          ...(productTags.map((tag: string) => like(schema.products.tags, `%"${tag}"%`)))
        )
      ),
      limit: 30
    });

    // 3. Get Reviews and Stats in parallel
    const [reviews, allApproved] = await Promise.all([
      db.select().from(schema.reviews)
        .where(and(eq(schema.reviews.productId, product.id), eq(schema.reviews.status, "approved")))
        .orderBy(desc(schema.reviews.createdAt))
        .limit(10),
      db.select().from(schema.reviews)
        .where(and(eq(schema.reviews.productId, product.id), eq(schema.reviews.status, "approved")))
    ]);

    // 4. Smart Scoring Logic (Behaviour + Content)
    const scoredRelated = candidates.map((p: any) => {
      let score = 0;
      
      // Content-Based
      if (p.categoryId === product.categoryId) score += 10;
      
      const pTags = JSON.parse(p.tags || "[]");
      const tagMatches = pTags.filter((t: string) => productTags.includes(t)).length;
      score += tagMatches * 5;

      // Behavioral Influence (if user recently viewed something similar)
      if (recentlyViewedIds.includes(p.id)) score -= 5; // Don't show what they just saw too prominently

      // Popularity
      score += (p.soldCount || 0) * 0.1;
      score += (p.rating || 0) * 2;

      // Price similarity (People often stay in a budget range)
      const priceDiff = Math.abs(p.price - product.price) / product.price;
      if (priceDiff < 0.2) score += 5;

      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

    // Calculate Review Stats
    let stats = null;
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

    // 5. Log Interaction (Optional - merged into same request)
    const logView = c.req.query("logView") === "true";
    if (logView) {
      // We don't need to await this if we want to return faster, 
      // but doing it in the same request ensures consistency.
      const userId = c.req.query("userId") || null;
      db.insert(schema.userInteractions).values({
        id: crypto.randomUUID(),
        productId: product.id,
        interactionType: 'view',
        userId: userId,
        weight: 1,
        createdAt: new Date()
      }).catch(err => console.error("Auto-log view error:", err));
    }

    return c.json({
      product: { ...product, _links: formatLinks(c, "/products", product.id) },
      relatedProducts: scoredRelated.map((r: any) => ({ ...r, _links: formatLinks(c, "/products", r.id) })),
      reviews: {
        items: reviews,
        stats
      }
    });
  } catch (error: any) {
    console.error("Bulk fetch error:", error.message);
    return c.json({ error: "Failed to fetch bulk data" }, 500);
  }
});

productsRouter.get("/by-slug/:slug", async (c) => {
  const slug = c.req.param("slug");
  const db = c.get("db");

  const [product] = await db.select().from(schema.products).where(eq(schema.products.slug, slug));
  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }

  return c.json({
    ...product,
    _links: formatLinks(c, "/products", product.id)
  });
});

productsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id));
  if (!product) throw new Error(`Product with ID ${id} not found`);

  return c.json({
    ...product,
    _links: formatLinks(c, "/products", id)
  });
});

productsRouter.post("/", async (c) => {
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
    images: body.images ? (typeof body.images === 'string' ? body.images : JSON.stringify(body.images)) : "[]",
    tags: body.tags ? (typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags)) : "[]",
    overview: body.overview || null,
    specification: body.specification || null,
    highlights: body.highlights ? (typeof body.highlights === 'string' ? body.highlights : JSON.stringify(body.highlights)) : null,
    howItWorks: body.howItWorks ? (typeof body.howItWorks === 'string' ? body.howItWorks : JSON.stringify(body.howItWorks)) : null,
    benefits: body.benefits ? (typeof body.benefits === 'string' ? body.benefits : JSON.stringify(body.benefits)) : null,
    videoUrl: body.videoUrl || null,
    faqs: body.faqs ? (typeof body.faqs === 'string' ? body.faqs : JSON.stringify(body.faqs)) : null,
    specSheetUrl: body.specSheetUrl || null,
    comparisonData: body.comparisonData ? (typeof body.comparisonData === 'string' ? body.comparisonData : JSON.stringify(body.comparisonData)) : null,
    bundleProducts: body.bundleProducts ? (typeof body.bundleProducts === 'string' ? body.bundleProducts : JSON.stringify(body.bundleProducts)) : null,
    qna: body.qna ? (typeof body.qna === 'string' ? body.qna : JSON.stringify(body.qna)) : null,
    deliveryInfo: body.deliveryInfo || null,
    warrantyInfo: body.warrantyInfo || null,
    offerDeadline: body.offerDeadline ? new Date(body.offerDeadline) : null,
    trustBadges: body.trustBadges ? (typeof body.trustBadges === 'string' ? body.trustBadges : JSON.stringify(body.trustBadges)) : null,
    rating: 0,
    reviewCount: 0,
    soldCount: body.soldCount || 0,
    lowStockThreshold: body.lowStockThreshold !== undefined ? Number(body.lowStockThreshold) : 5,
    isActive: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await invalidateHomeCache(db, schema);

  return c.json({
    id,
    message: "Product created successfully",
    _links: formatLinks(c, "/products", id)
  }, 201);
});

productsRouter.patch("/:id", async (c) => {
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
      images: body.images !== undefined ? (typeof body.images === 'string' ? body.images : JSON.stringify(body.images)) : existing.images,
      tags: body.tags !== undefined ? (typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags)) : existing.tags,
      overview: body.overview !== undefined ? body.overview : existing.overview,
      specification: body.specification !== undefined ? body.specification : existing.specification,
      highlights: body.highlights !== undefined ? (typeof body.highlights === 'string' ? body.highlights : JSON.stringify(body.highlights)) : existing.highlights,
      howItWorks: body.howItWorks !== undefined ? (typeof body.howItWorks === 'string' ? body.howItWorks : JSON.stringify(body.howItWorks)) : existing.howItWorks,
      benefits: body.benefits !== undefined ? (typeof body.benefits === 'string' ? body.benefits : JSON.stringify(body.benefits)) : existing.benefits,
      videoUrl: body.videoUrl !== undefined ? body.videoUrl : existing.videoUrl,
      faqs: body.faqs !== undefined ? (typeof body.faqs === 'string' ? body.faqs : JSON.stringify(body.faqs)) : existing.faqs,
      specSheetUrl: body.specSheetUrl !== undefined ? body.specSheetUrl : existing.specSheetUrl,
      comparisonData: body.comparisonData !== undefined ? (typeof body.comparisonData === 'string' ? body.comparisonData : JSON.stringify(body.comparisonData)) : existing.comparisonData,
      bundleProducts: body.bundleProducts !== undefined ? (typeof body.bundleProducts === 'string' ? body.bundleProducts : JSON.stringify(body.bundleProducts)) : existing.bundleProducts,
      qna: body.qna !== undefined ? (typeof body.qna === 'string' ? body.qna : JSON.stringify(body.qna)) : existing.qna,
      deliveryInfo: body.deliveryInfo !== undefined ? body.deliveryInfo : existing.deliveryInfo,
      warrantyInfo: body.warrantyInfo !== undefined ? body.warrantyInfo : existing.warrantyInfo,
      offerDeadline: body.offerDeadline !== undefined ? (body.offerDeadline ? new Date(body.offerDeadline) : null) : existing.offerDeadline,
      trustBadges: body.trustBadges !== undefined ? (typeof body.trustBadges === 'string' ? body.trustBadges : JSON.stringify(body.trustBadges)) : existing.trustBadges,
      soldCount: body.soldCount !== undefined ? Number(body.soldCount) : existing.soldCount,
      lowStockThreshold: body.lowStockThreshold !== undefined ? Number(body.lowStockThreshold) : existing.lowStockThreshold,
      isActive: body.isActive !== undefined ? (body.isActive ? 1 : 0) : existing.isActive,
      updatedAt: new Date()
    })
    .where(eq(schema.products.id, id));

  await invalidateHomeCache(db, schema);

  return c.json({
    message: "Product updated successfully",
    _links: formatLinks(c, "/products", id)
  });
});

productsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  await db.delete(schema.products).where(eq(schema.products.id, id));
  await invalidateHomeCache(db, schema);
  return c.body(null, 204);
});

productsRouter.post("/interactions", async (c) => {
  const db = c.get("db");
  const body = await c.req.json();
  const { productId, type, userId, sessionId } = body;

  if (!productId || !type) return c.json({ error: "Missing data" }, 400);

  const weight = type === 'purchase' ? 10 : type === 'add_to_cart' ? 3 : 1;

  await db.insert(schema.userInteractions).values({
    id: crypto.randomUUID(),
    productId,
    interactionType: type,
    userId: userId || null,
    sessionId: sessionId || null,
    weight,
    createdAt: new Date()
  });

  return c.json({ success: true });
});
