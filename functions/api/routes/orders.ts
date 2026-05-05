import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import { Bindings, Variables, formatLinks } from "../shared";
import {
  sendEmail,
  orderConfirmationEmailHtml,
  adminNewOrderEmailHtml,
  orderStatusUpdateEmailHtml,
} from "../utils/email";

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

  const orderItemsList = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id));
  
  // Fetch product names for the items
  const itemsWithProduct = await Promise.all(orderItemsList.map(async (item: any) => {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, item.productId));
    return {
      ...item,
      productName: product ? product.title : 'Deleted Product',
      productImage: product ? ((() => {
        try {
          const imgs = JSON.parse(product.images || '[]');
          return imgs[0] || null;
        } catch { return null; }
      })()) : null
    };
  }));

  const trackings = await db.select().from(schema.trackings).where(eq(schema.trackings.orderId, id));

  return c.json({
    ...order,
    items: itemsWithProduct,
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

  // ── Stock Validation ──────────────────────────────────
  for (const item of body.items) {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, item.productId));
    if (!product) {
      throw new Error(`VAL: Product "${item.productName || item.productId}" not found.`);
    }
    if ((product.stock ?? 0) < item.quantity) {
      throw new Error(
        `VAL: Insufficient stock for "${product.title}". Available: ${product.stock ?? 0}, Requested: ${item.quantity}.`
      );
    }
  }

  // ── Deduct stock & Increment Sold Count ────────────────
  for (const item of body.items) {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, item.productId));
    await db.update(schema.products)
      .set({ 
        stock: (product!.stock ?? 0) - item.quantity,
        soldCount: (product!.soldCount ?? 0) + item.quantity
      })
      .where(eq(schema.products.id, item.productId));
  }

  const id = crypto.randomUUID();
  
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();

  const existingOrders = await db.select().from(schema.orders);
  const orderNum = String(existingOrders.length + 1).padStart(3, '0');
  const invoiceId = `${dd}${mm}${yyyy}-${orderNum}`;
  
  const totalAmount = body.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  await db.insert(schema.orders).values({
    id,
    invoiceId,
    customerName: body.customerName,
    customerEmail: body.customerEmail || null,
    customerPhone: body.customerPhone || "N/A",
    shippingAddress: body.shippingAddress,
    totalAmount,
    status: body.paymentMethod && body.paymentMethod !== "cod" && body.paymentMethod !== "wallet" ? "Pending Verification" : "Pending",
    paymentMethod: body.paymentMethod || "cod",
    paymentPhone: body.paymentPhone || null,
    paymentTrxId: body.paymentTrxId || null,
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
    message: "Your order has been placed successfully and is awaiting approval.",
    createdAt: new Date(),
  });

  // ── Email: Customer Confirmation ──────────────────
  if (body.customerEmail && c.env.GOOGLE_SCRIPT_URL) {
    const itemSummary = body.items.map((item: any) => ({
      name: item.productName || item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: body.customerEmail,
      subject: `PlayPen House — Order Confirmed (${invoiceId})`,
      text: `Hi ${body.customerName}, your order ${invoiceId} has been placed! Total: $${totalAmount.toFixed(2)}`,
      html: orderConfirmationEmailHtml(invoiceId, body.customerName, totalAmount, itemSummary),
    }).catch(() => {}); // fire and forget
  }

  // ── Email: Admin Notification ─────────────────────
  const adminEmail = c.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail && c.env.GOOGLE_SCRIPT_URL) {
    sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: adminEmail,
      subject: `🔔 New Order Awaiting Approval — ${invoiceId}`,
      text: `New order from ${body.customerName}. Invoice: ${invoiceId}. Total: $${totalAmount.toFixed(2)}. ${body.items.length} item(s). Please log in to approve.`,
      html: adminNewOrderEmailHtml(invoiceId, body.customerName, totalAmount, body.items.length),
    }).catch(() => {}); // fire and forget
  }

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

  const newStatus = body.status ?? existing.status;

  await db.update(schema.orders)
    .set({
      status: newStatus,
    })
    .where(eq(schema.orders.id, id));

  // ── Notification: Notify customer about status change ────
  try {
    let notifyUserId = null;
    if (existing.customerEmail) {
      const [usr] = await db.select().from(schema.users).where(eq(schema.users.email, existing.customerEmail));
      if (usr) notifyUserId = usr.id;
    }
    await db.insert(schema.notifications).values({
      id: crypto.randomUUID(),
      userId: notifyUserId,
      title: `Order Status Updated — ${existing.invoiceId}`,
      message: `Your order ${existing.invoiceId} status is now: ${newStatus}.`,
      type: "order_status",
      isRead: 0,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to insert notification:", err);
  }

  // ── Email: Notify customer about status change ────
  if (existing.customerEmail && c.env.GOOGLE_SCRIPT_URL && newStatus !== existing.status) {
    sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: existing.customerEmail,
      subject: `PlayPen House — Order ${existing.invoiceId} is now "${newStatus}"`,
      text: `Hi ${existing.customerName}, your order ${existing.invoiceId} status has been updated to: ${newStatus}.`,
      html: orderStatusUpdateEmailHtml(
        existing.invoiceId!,
        existing.customerName,
        newStatus,
        body.message
      ),
    }).catch(() => {}); // fire and forget
  }

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

  // ── Notification: Notify customer about tracking status change ────
  try {
    let notifyUserId = null;
    if (existing.customerEmail) {
      const [usr] = await db.select().from(schema.users).where(eq(schema.users.email, existing.customerEmail));
      if (usr) notifyUserId = usr.id;
    }
    await db.insert(schema.notifications).values({
      id: crypto.randomUUID(),
      userId: notifyUserId,
      title: `Order Tracking Updated — ${existing.invoiceId}`,
      message: `Your order ${existing.invoiceId} tracking status is now: ${body.status}. ${body.message || ''}`,
      type: "order_status",
      isRead: 0,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to insert notification:", err);
  }

  // ── Email: Notify customer about tracking update ──
  if (existing.customerEmail && c.env.GOOGLE_SCRIPT_URL) {
    sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: existing.customerEmail,
      subject: `PlayPen House — Tracking Update for ${existing.invoiceId}`,
      text: `Hi ${existing.customerName}, your order ${existing.invoiceId} status: ${body.status}. ${body.message || ""}`,
      html: orderStatusUpdateEmailHtml(
        existing.invoiceId!,
        existing.customerName,
        body.status,
        body.message
      ),
    }).catch(() => {}); // fire and forget
  }

  return c.json({ 
    id: trackingId, 
    message: "Tracking added successfully",
    _links: formatLinks(c, "/orders", id)
  }, 201);
});

// ── POST /orders/:id/cancel ─────────────────────────
// Customer-facing cancellation (only for Pending/Processing orders)
ordersRouter.post("/:id/cancel", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json().catch(() => ({}));

  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
  if (!order) throw new Error(`Order with ID ${id} not found`);

  const status = order.status?.toLowerCase();
  if (status !== "pending" && status !== "processing") {
    return c.json({
      error: "ValidationError",
      message: `Cannot cancel an order with status "${order.status}". Only Pending or Processing orders can be cancelled.`,
    }, 422);
  }

  // Update order status
  await db.update(schema.orders)
    .set({ status: "Cancelled" })
    .where(eq(schema.orders.id, id));

  // Add tracking entry
  await db.insert(schema.trackings).values({
    id: crypto.randomUUID(),
    orderId: id,
    status: "Cancelled",
    message: body.reason
      ? `Order cancelled by customer. Reason: ${body.reason}`
      : "Order cancelled by customer.",
    createdAt: new Date(),
  });

  // Restore stock & Decrement Sold Count for cancelled items
  const orderItems = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id));
  for (const item of orderItems) {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, item.productId));
    if (product) {
      await db.update(schema.products)
        .set({ 
          stock: (product.stock ?? 0) + item.quantity,
          soldCount: Math.max(0, (product.soldCount ?? 0) - item.quantity)
        })
        .where(eq(schema.products.id, item.productId));
    }
  }

  // Email customer about cancellation
  if (order.customerEmail && c.env.GOOGLE_SCRIPT_URL) {
    sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: order.customerEmail,
      subject: `PlayPen House — Order ${order.invoiceId} Cancelled`,
      text: `Hi ${order.customerName}, your order ${order.invoiceId} has been cancelled.`,
      html: orderStatusUpdateEmailHtml(
        order.invoiceId!,
        order.customerName,
        "Cancelled",
        body.reason || "Cancelled by customer"
      ),
    }).catch(() => {});
  }

  return c.json({
    message: "Order cancelled successfully.",
    _links: formatLinks(c, "/orders", id),
  });
});
