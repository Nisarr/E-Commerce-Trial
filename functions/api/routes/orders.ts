import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import { Bindings, Variables, formatLinks } from "../shared";

export const ordersRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

ordersRouter.get("/", async (c) => {
  try {
    const db = c.get("db");
    const customerName = c.req.query("customerName");
    
    const rows = await db.query.orders.findMany({
      where: customerName ? (o: any, { eq }: any) => eq(o.customerName, customerName) : undefined,
      orderBy: (o: any, { desc }: any) => [desc(o.createdAt)],
    });

    return c.json({
      items: rows.map(r => ({ ...r, _links: formatLinks(c, "/orders", r.id) })),
      _links: formatLinks(c, "/orders")
    });
  } catch (error: any) {
    console.error("Fetch orders error:", error.message);
    return c.json({ items: [], _links: formatLinks(c, "/orders") });
  }
});

ordersRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
  if (!order) throw new Error(`Order with ID ${id} not found`);

  const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id));
  const trackings = await db.select().from(schema.trackings).where(eq(schema.trackings.orderId, id));

  return c.json({
    ...order,
    items,
    trackings: trackings.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()), // newest first
    _links: formatLinks(c, "/orders", id)
  });
});

ordersRouter.post("/", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);
  
  if (!body?.customerName || !body?.shippingAddress || !body?.items || !body.items.length) {
    throw new Error("VAL: Customer name, shipping address, and items are required fields.");
  }

  const id = crypto.randomUUID();
  const invoiceId = "INV-" + Date.now().toString().slice(-6) + "-" + crypto.randomUUID().slice(0, 4).toUpperCase();
  
  const totalAmount = body.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  await db.insert(schema.orders).values({
    id,
    invoiceId,
    customerName: body.customerName,
    customerEmail: body.customerEmail || null,
    customerPhone: body.customerPhone || "N/A",
    shippingAddress: body.shippingAddress,
    totalAmount,
    status: "Pending",
    createdAt: new Date(),
  });

  for (const item of body.items) {
    await db.insert(schema.orderItems).values({
      id: crypto.randomUUID(),
      orderId: id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    });
  }

  await db.insert(schema.trackings).values({
    id: crypto.randomUUID(),
    orderId: id,
    status: "Order Placed",
    message: "Your order has been placed successfully.",
    createdAt: new Date(),
  });

  return c.json({ 
    id, 
    invoiceId,
    message: "Order placed successfully",
    _links: formatLinks(c, "/orders", id)
  }, 201);
});

ordersRouter.patch("/:id/status", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();
  
  const [existing] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
  if (!existing) throw new Error(`Order with ID ${id} not found`);

  await db.update(schema.orders)
    .set({
      status: body.status ?? existing.status,
    })
    .where(eq(schema.orders.id, id));

  return c.json({ 
    message: "Order status updated successfully",
    _links: formatLinks(c, "/orders", id)
  });
});

ordersRouter.post("/:id/trackings", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();
  
  const [existing] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
  if (!existing) throw new Error(`Order with ID ${id} not found`);

  if (!body?.status) {
    throw new Error("VAL: Tracking status is required.");
  }

  const trackingId = crypto.randomUUID();
  await db.insert(schema.trackings).values({
    id: trackingId,
    orderId: id,
    status: body.status,
    message: body.message || null,
    location: body.location || null,
    createdAt: new Date(),
  });

  await db.update(schema.orders).set({ status: body.status }).where(eq(schema.orders.id, id));

  return c.json({ 
    id: trackingId, 
    message: "Tracking added successfully",
    _links: formatLinks(c, "/orders", id)
  }, 201);
});
