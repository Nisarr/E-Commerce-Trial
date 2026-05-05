import { Hono } from "hono";
import { eq, count, like, or, and, isNotNull } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import { Bindings, Variables, formatLinks, createPaginatedResponse } from "../shared";

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
        return [desc(p.rating)]; // trending/default
      }
    });

    return c.json(createPaginatedResponse(
      rows.map(r => ({ ...r, _links: formatLinks(c, "/products", r.id) })),
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
      items: rows.map(r => ({ ...r, _links: formatLinks(c, "/products", r.id) })),
      query: q,
      _links: formatLinks(c, "/products/search")
    });
  } catch (error: any) {
    console.error("Search products error:", error.message);
    return c.json({ items: [], query: c.req.query("q") ?? "", _links: formatLinks(c, "/products/search") });
  }
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
    images: body.images ? JSON.stringify(body.images) : "[]",
    tags: body.tags ? JSON.stringify(body.tags) : "[]",
    rating: 0,
    reviewCount: 0,
    soldCount: body.soldCount || 0,
    isActive: 1,
    createdAt: new Date(),
  });

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
      images: body.images ? JSON.stringify(body.images) : existing.images,
      tags: body.tags ? JSON.stringify(body.tags) : existing.tags,
      soldCount: body.soldCount !== undefined ? Number(body.soldCount) : existing.soldCount,
      isActive: body.isActive !== undefined ? (body.isActive ? 1 : 0) : existing.isActive,
    })
    .where(eq(schema.products.id, id));

  return c.json({ 
    message: "Product updated successfully",
    _links: formatLinks(c, "/products", id)
  });
});

productsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  
  await db.delete(schema.products).where(eq(schema.products.id, id));
  return c.body(null, 204);
});
