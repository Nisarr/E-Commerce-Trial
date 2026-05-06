import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";
import { formatLinks, invalidateHomeCache } from "../utils/helpers";

export const categoriesRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

categoriesRouter.get("/", async (c) => {
  try {
    const db = c.get("db");
    const featured = c.req.query("featured") === "true";
    const showAll = c.req.query("all") === "true";

    const rows = await db.query.categories.findMany({
      where: (cat: any, { eq, and }: any) => {
        if (showAll && !featured) return undefined;

        const filters = [];
        if (!showAll) filters.push(eq(cat.isActive, 1));
        if (featured) filters.push(eq(cat.isFeatured, 1));

        return filters.length > 0 ? and(...filters) : undefined;
      },
    });

    return c.json({
      items: rows.map((r: any) => ({
        ...r,
        _links: formatLinks(c, "/categories", r.id)
      })),
      _links: formatLinks(c, "/categories")
    });
  } catch (error: any) {
    console.error("Fetch categories error:", error.message);
    return c.json({ items: [], _links: formatLinks(c, "/categories") });
  }
});

categoriesRouter.post("/", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.name) {
    throw new Error("VAL: Category name is required.");
  }

  const id = crypto.randomUUID();
  const slug = body.name.toLowerCase().replace(/ /g, "-") + "-" + id.slice(0, 5);

  await db.insert(schema.categories).values({
    id,
    name: body.name,
    slug: body.slug || slug,
    parentId: body.parentId || null,
    image: body.image || null,
    isFeatured: body.isFeatured ? 1 : 0,
    isActive: body.isActive !== undefined ? (body.isActive ? 1 : 0) : 1,
  });

  await invalidateHomeCache(db, schema);

  return c.json({
    id,
    message: "Category created successfully",
    _links: formatLinks(c, "/categories", id)
  }, 201);
});

categoriesRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();

  const [existing] = await db.select().from(schema.categories).where(eq(schema.categories.id, id));
  if (!existing) throw new Error(`Category with ID ${id} not found`);

  await db.update(schema.categories)
    .set({
      name: body.name ?? existing.name,
      slug: body.slug ?? existing.slug,
      parentId: body.parentId !== undefined ? body.parentId : existing.parentId,
      image: body.image ?? existing.image,
      isFeatured: body.isFeatured !== undefined ? (body.isFeatured ? 1 : 0) : existing.isFeatured,
      isActive: body.isActive !== undefined ? (body.isActive ? 1 : 0) : existing.isActive,
    })
    .where(eq(schema.categories.id, id));

  await invalidateHomeCache(db, schema);

  return c.json({
    message: "Category updated successfully",
    _links: formatLinks(c, "/categories", id)
  });
});

categoriesRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  await db.delete(schema.categories).where(eq(schema.categories.id, id));
  await invalidateHomeCache(db, schema);
  return c.body(null, 204);
});
