import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";
import { formatLinks } from "../utils/helpers";

export const couponsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET — Read-only list (preview data for trial)
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

// GET — Validate (MUST remain functional for storefront checkout)
couponsRouter.get("/validate", async (c) => {
  const db = c.get("db");
  const code = c.req.query("code")?.toUpperCase();
  const orderTotal = parseFloat(c.req.query("total") || "0");

  if (!code) throw new Error("VAL: Coupon code is required.");

  const [coupon] = await db.select().from(schema.coupons).where(eq(schema.coupons.code, code));

  if (!coupon || !coupon.isActive) {
    return c.json({ valid: false, message: "Invalid or expired coupon code." }, 404);
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return c.json({ valid: false, message: "This coupon has expired." });
  }
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > Date.now()) {
    return c.json({ valid: false, message: "This coupon is not yet active." });
  }
  if (coupon.usageLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) {
    return c.json({ valid: false, message: "This coupon has reached its usage limit." });
  }
  if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
    return c.json({ valid: false, message: `Minimum order amount of ৳${coupon.minOrderAmount.toLocaleString()} required.` });
  }

  let discount = 0;
  if (coupon.type === "percentage") {
    discount = (orderTotal * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
  } else {
    discount = coupon.value;
  }
  discount = Math.min(discount, orderTotal);

  return c.json({
    valid: true,
    coupon: { code: coupon.code, description: coupon.description, type: coupon.type, value: coupon.value },
    discount: Math.round(discount * 100) / 100,
    message: `Coupon applied! You save ৳${discount.toLocaleString()}.`,
  });
});

// MUTATIONS — Premium only (stubbed)
const premiumStub = (c: any) => c.json({
  error: "PremiumRequired",
  message: "This feature requires Premium. Contact Orbit SaaS to upgrade.",
  upgradeUrl: "https://orbitsaas.cloud/"
}, 403);

couponsRouter.post("/", premiumStub);
couponsRouter.patch("/:id", premiumStub);
couponsRouter.delete("/:id", premiumStub);
