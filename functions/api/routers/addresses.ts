import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";
import { formatLinks } from "../utils/helpers";

export const addressesRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

addressesRouter.get("/", async (c) => {
  const db = c.get("db");
  const userId = c.req.query("userId");

  if (!userId) {
    throw new Error("VAL: userId query parameter is required.");
  }

  const rows = await db.query.addresses.findMany({
    where: (a: any, { eq }: any) => eq(a.userId, userId),
    orderBy: (a: any, { desc }: any) => [desc(a.isDefault), desc(a.createdAt)],
  });

  return c.json({
    items: rows.map((r: any) => ({ ...r, _links: formatLinks(c, "/addresses", r.id) })),
    _links: formatLinks(c, "/addresses"),
  });
});

addressesRouter.post("/", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.userId || !body?.fullName || !body?.phone || !body?.address) {
    throw new Error("VAL: userId, fullName, phone, and address are required.");
  }

  const id = crypto.randomUUID();

  // If this is set as default, unset all others
  if (body.isDefault) {
    await db.update(schema.addresses)
      .set({ isDefault: 0 })
      .where(eq(schema.addresses.userId, body.userId));
  }

  await db.insert(schema.addresses).values({
    id,
    userId: body.userId,
    label: body.label || "Home",
    fullName: body.fullName,
    phone: body.phone,
    address: body.address,
    city: body.city || null,
    postalCode: body.postalCode || null,
    isDefault: body.isDefault ? 1 : 0,
    createdAt: new Date(),
  });

  return c.json({
    id,
    message: "Address added successfully",
    _links: formatLinks(c, "/addresses", id),
  }, 201);
});

addressesRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();

  const [existing] = await db.select().from(schema.addresses).where(eq(schema.addresses.id, id));
  if (!existing) throw new Error(`Address with ID ${id} not found`);

  const updates: Record<string, any> = {};
  if (body.label !== undefined) updates.label = body.label;
  if (body.fullName !== undefined) updates.fullName = body.fullName;
  if (body.phone !== undefined) updates.phone = body.phone;
  if (body.address !== undefined) updates.address = body.address;
  if (body.city !== undefined) updates.city = body.city;
  if (body.postalCode !== undefined) updates.postalCode = body.postalCode;

  if (body.isDefault) {
    await db.update(schema.addresses)
      .set({ isDefault: 0 })
      .where(eq(schema.addresses.userId, existing.userId));
    updates.isDefault = 1;
  }

  if (Object.keys(updates).length > 0) {
    await db.update(schema.addresses).set(updates).where(eq(schema.addresses.id, id));
  }

  return c.json({
    message: "Address updated successfully",
    _links: formatLinks(c, "/addresses", id),
  });
});

addressesRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  const [existing] = await db.select().from(schema.addresses).where(eq(schema.addresses.id, id));
  if (!existing) throw new Error(`Address with ID ${id} not found`);

  await db.delete(schema.addresses).where(eq(schema.addresses.id, id));

  return c.json({ message: "Address deleted successfully" });
});
