import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";
import { formatLinks } from "../utils/helpers";

export const returnsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

returnsRouter.get("/", async (c) => {
  const db = c.get("db");
  const userId = c.req.query("userId");
  const type = c.req.query("type"); // "return" | "cancellation"

  const rows = await db.query.returns.findMany({
    where: (r: any, { eq, and }: any) => {
      const conditions = [];
      if (userId) conditions.push(eq(r.userId, userId));
      if (type) conditions.push(eq(r.type, type));
      return conditions.length > 1 ? and(...conditions) : conditions[0];
    },
    orderBy: (r: any, { desc }: any) => [desc(r.createdAt)],
  });

  return c.json({
    items: rows.map((r: any) => ({ ...r, _links: formatLinks(c, "/returns", r.id) })),
    _links: formatLinks(c, "/returns"),
  });
});

returnsRouter.post("/", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.orderId || !body?.userId || !body?.reason || !body?.type) {
    throw new Error("VAL: orderId, userId, reason, and type are required.");
  }

  if (!["return", "cancellation"].includes(body.type)) {
    throw new Error("VAL: type must be 'return' or 'cancellation'.");
  }

  // Validate order exists and belongs to user
  const [order] = await db.select().from(schema.orders)
    .where(eq(schema.orders.id, body.orderId));

  if (!order) throw new Error(`Order with ID ${body.orderId} not found`);

  // Business rules
  const status = order.status?.toLowerCase();
  if (body.type === "cancellation") {
    if (status !== "pending" && status !== "processing") {
      throw new Error("VAL: Orders can only be cancelled when in Pending or Processing status.");
    }
  } else if (body.type === "return") {
    if (status !== "delivered") {
      throw new Error("VAL: Returns can only be requested for Delivered orders.");
    }
    // Check 7-day window
    if (order.createdAt) {
      const deliveredDate = new Date(order.createdAt);
      const daysSince = (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > 7) {
        throw new Error("VAL: Return window has expired (7 days from delivery).");
      }
    }
  }

  // Check for duplicate request
  const existingReturns = await db.select().from(schema.returns)
    .where(and(
      eq(schema.returns.orderId, body.orderId),
      eq(schema.returns.type, body.type)
    ));
  if (existingReturns.length > 0) {
    throw new Error(`VAL: A ${body.type} request already exists for this order.`);
  }

  const id = crypto.randomUUID();

  await db.insert(schema.returns).values({
    id,
    orderId: body.orderId,
    userId: body.userId,
    reason: body.reason,
    details: body.details || null,
    images: body.images ? (typeof body.images === 'string' ? body.images : JSON.stringify(body.images)) : null,
    status: "Requested",
    type: body.type,
    createdAt: new Date(),
  });

  // If cancellation, update order status immediately
  if (body.type === "cancellation") {
    await db.update(schema.orders)
      .set({ status: "Cancelled" })
      .where(eq(schema.orders.id, body.orderId));

    // Add tracking entry
    await db.insert(schema.trackings).values({
      id: crypto.randomUUID(),
      orderId: body.orderId,
      status: "Cancelled",
      message: `Order cancelled by customer. Reason: ${body.reason}`,
      createdAt: new Date(),
    });
  }

  return c.json({
    id,
    message: `${body.type === "cancellation" ? "Cancellation" : "Return"} request submitted successfully`,
    _links: formatLinks(c, "/returns", id),
  }, 201);
});

returnsRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();

  const [existing] = await db.select().from(schema.returns).where(eq(schema.returns.id, id));
  if (!existing) throw new Error(`Return request with ID ${id} not found`);

  const updates: Record<string, any> = {};
  if (body.status) updates.status = body.status;
  if (body.adminNotes !== undefined) updates.adminNotes = body.adminNotes;

  if (Object.keys(updates).length > 0) {
    await db.update(schema.returns).set(updates).where(eq(schema.returns.id, id));
  }

  return c.json({
    message: "Return request updated successfully",
    _links: formatLinks(c, "/returns", id),
  });
});

returnsRouter.patch("/:id/status", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();

  const [existing] = await db.select().from(schema.returns).where(eq(schema.returns.id, id));
  if (!existing) throw new Error(`Return request with ID ${id} not found`);

  const updates: Record<string, any> = {};
  if (body.status) updates.status = body.status;
  if (body.adminNotes) updates.adminNotes = body.adminNotes;

  if (Object.keys(updates).length > 0) {
    await db.update(schema.returns).set(updates).where(eq(schema.returns.id, id));
  }

  return c.json({
    message: "Return request updated successfully",
    _links: formatLinks(c, "/returns", id),
  });
});
