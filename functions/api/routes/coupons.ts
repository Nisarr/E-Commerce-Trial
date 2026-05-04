import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import { Bindings, Variables, formatLinks } from "../shared";

export const couponsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ── GET /coupons ────────────────────────────────────
couponsRouter.get("/", async (c) => {
  const db = c.get("db");
  const rows = await db.query.coupons.findMany({
    orderBy: (cp: any, { desc }: any) => [desc(cp.createdAt)],
  });
  return c.json({
    items: rows.map((r) => ({ ...r, _links: formatLinks(c, "/coupons", r.id) })),
    _links: formatLinks(c, "/coupons"),
  });
});

// ── GET /coupons/validate?code=XXX&total=100 ────────
// Customer-facing: check if a coupon is valid
couponsRouter.get("/validate", async (c) => {
  const db = c.get("db");
  const code = c.req.query("code")?.toUpperCase();
  const orderTotal = parseFloat(c.req.query("total") || "0");

  if (!code) throw new Error("VAL: Coupon code is required.");

  const [coupon] = await db.select().from(schema.coupons).where(eq(schema.coupons.code, code));

  if (!coupon || !coupon.isActive) {
    return c.json({ valid: false, message: "Invalid or expired coupon code." }, 404);
  }

  // Check expiration
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return c.json({ valid: false, message: "This coupon has expired." });
  }

  // Check start date
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > Date.now()) {
    return c.json({ valid: false, message: "This coupon is not yet active." });
  }

  // Check usage limit
  if (coupon.usageLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) {
    return c.json({ valid: false, message: "This coupon has reached its usage limit." });
  }

  // Check minimum order
  if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
    return c.json({
      valid: false,
      message: `Minimum order amount of ৳${coupon.minOrderAmount.toLocaleString()} required.`,
    });
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === "percentage") {
    discount = (orderTotal * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.value;
  }
  discount = Math.min(discount, orderTotal); // Can't exceed order total

  return c.json({
    valid: true,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
    },
    discount: Math.round(discount * 100) / 100,
    message: `Coupon applied! You save ৳${discount.toLocaleString()}.`,
  });
});

// ── POST /coupons ───────────────────────────────────
couponsRouter.post("/", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.code || !body?.type || body?.value === undefined) {
    throw new Error("VAL: Code, type, and value are required.");
  }

  const id = crypto.randomUUID();
  await db.insert(schema.coupons).values({
    id,
    code: body.code.toUpperCase(),
    description: body.description || null,
    type: body.type,
    value: body.value,
    minOrderAmount: body.minOrderAmount || 0,
    maxDiscount: body.maxDiscount || null,
    usageLimit: body.usageLimit || null,
    isActive: body.isActive ?? 1,
    startsAt: body.startsAt ? new Date(body.startsAt) : null,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    createdAt: new Date(),
  });

  return c.json({ id, message: "Coupon created successfully", _links: formatLinks(c, "/coupons", id) }, 201);
});

// ── PATCH /coupons/:id ──────────────────────────────
couponsRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();

  const [existing] = await db.select().from(schema.coupons).where(eq(schema.coupons.id, id));
  if (!existing) throw new Error(`Coupon with ID ${id} not found`);

  const updates: Record<string, any> = {};
  if (body.code !== undefined) updates.code = body.code.toUpperCase();
  if (body.description !== undefined) updates.description = body.description;
  if (body.type !== undefined) updates.type = body.type;
  if (body.value !== undefined) updates.value = body.value;
  if (body.minOrderAmount !== undefined) updates.minOrderAmount = body.minOrderAmount;
  if (body.maxDiscount !== undefined) updates.maxDiscount = body.maxDiscount;
  if (body.usageLimit !== undefined) updates.usageLimit = body.usageLimit;
  if (body.isActive !== undefined) updates.isActive = body.isActive;
  if (body.startsAt !== undefined) updates.startsAt = body.startsAt ? new Date(body.startsAt) : null;
  if (body.expiresAt !== undefined) updates.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  if (Object.keys(updates).length > 0) {
    await db.update(schema.coupons).set(updates).where(eq(schema.coupons.id, id));
  }

  return c.json({ message: "Coupon updated successfully", _links: formatLinks(c, "/coupons", id) });
});

// ── DELETE /coupons/:id ─────────────────────────────
couponsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  await db.delete(schema.coupons).where(eq(schema.coupons.id, id));
  return c.json({ message: "Coupon deleted successfully" });
});
