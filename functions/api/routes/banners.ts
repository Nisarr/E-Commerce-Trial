import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import { Bindings, Variables, formatLinks } from "../shared";

export const bannersRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

bannersRouter.get("/", async (c) => {
  try {
    const position = c.req.query("position");
    const db = c.get("db");
    
    const rows = await db.query.banners.findMany({
      where: position ? (b: any, { eq }: any) => eq(b.position, position) : undefined,
      orderBy: (b: any, { asc }: any) => [asc(b.order)],
    });

    return c.json({
      items: rows.map(r => ({
        ...r,
        _links: formatLinks(c, "/banners", r.id)
      })),
      _links: formatLinks(c, "/banners")
    });
  } catch (error: any) {
    console.error("Fetch banners error:", error.message);
    return c.json({ items: [], _links: formatLinks(c, "/banners") });
  }
});

bannersRouter.post("/", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);
  
  if (!body?.image || !body?.position) {
    throw new Error("VAL: Image and position are required fields.");
  }

  const id = crypto.randomUUID();
  await db.insert(schema.banners).values({
    id,
    image: body.image,
    link: body.link || null,
    position: body.position,
    order: Number(body.order) || 0,
    isActive: 1,
  });

  return c.json({ 
    id, 
    message: "Banner created successfully",
    _links: formatLinks(c, "/banners", id)
  }, 201);
});

bannersRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();
  
  const [existing] = await db.select().from(schema.banners).where(eq(schema.banners.id, id));
  if (!existing) throw new Error(`Banner with ID ${id} not found`);

  await db.update(schema.banners)
    .set({
      image: body.image ?? existing.image,
      link: body.link ?? existing.link,
      position: body.position ?? existing.position,
      order: body.order !== undefined ? Number(body.order) : existing.order,
      isActive: body.isActive !== undefined ? (body.isActive ? 1 : 0) : existing.isActive,
    })
    .where(eq(schema.banners.id, id));

  return c.json({ 
    message: "Banner updated successfully",
    _links: formatLinks(c, "/banners", id)
  });
});

bannersRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  
  await db.delete(schema.banners).where(eq(schema.banners.id, id));
  return c.body(null, 204);
});
