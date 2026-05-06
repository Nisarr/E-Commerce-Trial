import { Hono } from "hono";
import { eq, and, desc, or } from "drizzle-orm";
import { verify } from "hono/jwt";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";
import { formatLinks } from "../utils/helpers";
import { 
  sendEmail, 
  orderConfirmationEmailHtml, 
  orderStatusUpdateEmailHtml,
  adminNewOrderEmailHtml 
} from "../utils/email";

export const ordersRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

ordersRouter.get("/", async (c) => {
  try {
    const db = c.get("db");
    const customerName = c.req.query("customerName");
    const userId = c.req.query("userId");

    const rows = await db.query.orders.findMany({
      where: (o: any, { eq, and }: any) => {
        const filters = [];
        if (customerName && customerName.trim() !== "") filters.push(eq(o.customerName, customerName));
        if (userId && userId.trim() !== "") filters.push(eq(o.userId, userId));
        return filters.length > 0 ? and(...filters) : undefined;
      },
      orderBy: (o: any, { desc }: any) => [desc(o.createdAt)],
    });

    return c.json({
      items: rows.map((r: any) => ({ 
        ...r, 
        totalAmount: Number(r.totalAmount || 0),
        _links: formatLinks(c, "/orders", r.id) 
      })),
      _links: formatLinks(c, "/orders")
    });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
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
    trackings: trackings.sort((a: any, b: any) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()), // newest first
    _links: formatLinks(c, "/orders", id)
  });
});

ordersRouter.post("/", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.customerName || !body?.shippingAddress || !body?.items || !body.items.length) {
    throw new Error("VAL: Customer name, shipping address, and items are required fields.");
  }

  // Stock Validation
  for (const item of body.items) {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, item.productId));
    if (!product) {
      throw new Error(`VAL: Product "${item.productName || item.productId}" not found.`);
    }
    const availableStock = (product.stock ?? 0) - (product.soldCount ?? 0);
    if (availableStock < item.quantity) {
      throw new Error(
        `VAL: Insufficient stock for "${product.title}". Available: ${availableStock}, Requested: ${item.quantity}.`
      );
    }
  }

  // Increment Sold Count
  for (const item of body.items) {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, item.productId));
    await db.update(schema.products)
      .set({
        soldCount: (product!.soldCount ?? 0) + item.quantity
      })
      .where(eq(schema.products.id, item.productId));
  }

  const id = crypto.randomUUID();

  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();

  const allOrders = await db.select().from(schema.orders);
  const orderNum = String(allOrders.length + 1).padStart(3, '0');
  const invoiceId = `${dd}${mm}${yyyy}-${orderNum}`;

  const totalAmount = body.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  let userId = body.userId;

  // If userId is missing from payload, try to securely extract it from the JWT
  if (!userId) {
    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const payload = await verify(token, c.env.JWT_SECRET || "fallback-dev-secret-change-me", "HS256");
        if (payload && payload.sub) {
          userId = payload.sub as string;
        }
      } catch (e) {
        // Token invalid or expired, proceed as guest checkout
      }
    }
  }

  await db.insert(schema.orders).values({
    id,
    invoiceId,
    userId: userId || null,
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

  // Admin Notification: System Log
  try {
    await db.insert(schema.notifications).values({
      id: crypto.randomUUID(),
      userId: null, // Global/Admin
      title: `New Order: ${invoiceId}`,
      message: `A new order has been placed by ${body.customerName} for $${totalAmount.toFixed(2)}.`,
      type: "new_order",
      orderId: id,
      isRead: 0,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to insert admin order notification:", err);
  }

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

  // Email: Customer Confirmation
  if (body.customerEmail && c.env.GOOGLE_SCRIPT_URL) {
    const itemSummary = body.items.map((item: any) => ({
      name: item.productName || item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const customerEmailPromise = sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: body.customerEmail,
      subject: `PlayPen House — Order Confirmed (${invoiceId})`,
      text: `Hi ${body.customerName}, your order ${invoiceId} has been placed! Total: $${totalAmount.toFixed(2)}`,
      html: orderConfirmationEmailHtml(invoiceId, body.customerName, totalAmount, itemSummary),
    }).catch(err => console.error("[EMAIL] Customer confirmation failed:", err));
    
    if (c.executionCtx) c.executionCtx.waitUntil(customerEmailPromise);
  }

  // Email: Admin Notification
  const adminEmail = c.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail && c.env.GOOGLE_SCRIPT_URL) {
    const adminEmailPromise = sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: adminEmail,
      subject: `🔔 New Order Awaiting Approval — ${invoiceId}`,
      text: `New order from ${body.customerName}. Invoice: ${invoiceId}. Total: $${totalAmount.toFixed(2)}. ${body.items.length} item(s). Please log in to approve.`,
      html: adminNewOrderEmailHtml(invoiceId, body.customerName, totalAmount, body.items.length),
    }).catch(err => console.error("[EMAIL] Admin notification failed:", err));

    if (c.executionCtx) c.executionCtx.waitUntil(adminEmailPromise);
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

  // Admin Check
  const authHeader = c.req.header("Authorization");
  const apiKey = c.env.ADMIN_API_KEY;
  let isAdmin = apiKey && authHeader === `Bearer ${apiKey}`;
  
  if (!isAdmin && authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const payload = await verify(token, c.env.JWT_SECRET || "fallback-dev-secret-change-me", "HS256");
      if (payload.role === "admin") isAdmin = true;
    } catch {}
  }

  if (!isAdmin) {
    return c.json({ error: "Unauthorized", message: "Only admins can update order status directly." }, 401);
  }

  const [existing] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
  if (!existing) throw new Error(`Order with ID ${id} not found`);

  const newStatus = body.status ?? existing.status;

  await db.update(schema.orders)
    .set({
      status: newStatus,
    })
    .where(eq(schema.orders.id, id));

  // Add tracking entry for the status update
  if (newStatus !== existing.status) {
    await db.insert(schema.trackings).values({
      id: crypto.randomUUID(),
      orderId: id,
      status: newStatus,
      message: body.message || `Order status updated to ${newStatus}.`,
      location: body.location || null,
      createdAt: new Date(),
    });
  }

  // Notification: Notify customer about status change
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
      orderId: id,
      isRead: 0,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to insert notification:", err);
  }

  // Email: Notify customer about status change
  if (existing.customerEmail && c.env.GOOGLE_SCRIPT_URL && newStatus !== existing.status) {
    const statusUpdatePromise = sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: existing.customerEmail,
      subject: `PlayPen House — Order ${existing.invoiceId} is now "${newStatus}"`,
      text: `Hi ${existing.customerName}, your order ${existing.invoiceId} status has been updated to: ${newStatus}.`,
      html: orderStatusUpdateEmailHtml(
        existing.invoiceId!,
        existing.customerName,
        newStatus,
        body.message
      ),
    }).catch(err => console.error("[EMAIL] Status update email failed:", err));

    if (c.executionCtx) c.executionCtx.waitUntil(statusUpdatePromise);
  }

  return c.json({
    message: "Order status updated successfully",
    _links: formatLinks(c, "/orders", id)
  });
});

ordersRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();

  // Admin Check
  const authHeader = c.req.header("Authorization");
  const apiKey = c.env.ADMIN_API_KEY;
  let isAdmin = apiKey && authHeader === `Bearer ${apiKey}`;
  
  if (!isAdmin && authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const payload = await verify(token, c.env.JWT_SECRET || "fallback-dev-secret-change-me", "HS256");
      if (payload.role === "admin") isAdmin = true;
    } catch {}
  }

  if (!isAdmin) {
    return c.json({ error: "Unauthorized", message: "Only admins can update order details." }, 401);
  }

  const [existing] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
  if (!existing) throw new Error(`Order with ID ${id} not found`);

  await db.update(schema.orders)
    .set({
      customerPhone: body.customerPhone ?? existing.customerPhone,
      shippingAddress: body.shippingAddress ?? existing.shippingAddress,
      internalNote: body.internalNote ?? existing.internalNote,
      courierId: body.courierId ?? existing.courierId,
      courierLink: body.courierLink ?? existing.courierLink,
      status: body.status ?? existing.status,
    })
    .where(eq(schema.orders.id, id));

  return c.json({
    message: "Order updated successfully",
    _links: formatLinks(c, "/orders", id)
  });
});

ordersRouter.post("/:id/trackings", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();

  // Admin Check
  const authHeader = c.req.header("Authorization");
  const apiKey = c.env.ADMIN_API_KEY;
  let isAdmin = apiKey && authHeader === `Bearer ${apiKey}`;
  
  if (!isAdmin && authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const payload = await verify(token, c.env.JWT_SECRET || "fallback-dev-secret-change-me", "HS256");
      if (payload.role === "admin") isAdmin = true;
    } catch {}
  }

  if (!isAdmin) {
    return c.json({ error: "Unauthorized", message: "Only admins can add tracking updates." }, 401);
  }

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

  // Notification: Notify customer about tracking status change
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
      orderId: id,
      isRead: 0,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to insert notification:", err);
  }

  // Email: Notify customer about tracking update
  if (existing.customerEmail && c.env.GOOGLE_SCRIPT_URL) {
    const trackingUpdatePromise = sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: existing.customerEmail,
      subject: `PlayPen House — Tracking Update for ${existing.invoiceId}`,
      text: `Hi ${existing.customerName}, your order ${existing.invoiceId} status: ${body.status}. ${body.message || ""}`,
      html: orderStatusUpdateEmailHtml(
        existing.invoiceId!,
        existing.customerName,
        body.status,
        body.message
      ),
    }).catch(err => console.error("[EMAIL] Tracking update email failed:", err));

    if (c.executionCtx) c.executionCtx.waitUntil(trackingUpdatePromise);
  }

  return c.json({
    id: trackingId,
    message: "Tracking added successfully",
    _links: formatLinks(c, "/orders", id)
  }, 201);
});

ordersRouter.post("/:id/cancel", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json().catch(() => ({}));

  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
  if (!order) throw new Error(`Order with ID ${id} not found`);

  const status = order.status?.toLowerCase();
  
  // Admin Check
  const authHeader = c.req.header("Authorization");
  const apiKey = c.env.ADMIN_API_KEY;
  let isAdmin = apiKey && authHeader === `Bearer ${apiKey}`;
  
  // If not admin by API key, check JWT role
  if (!isAdmin && authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const payload = await verify(token, c.env.JWT_SECRET || "fallback-dev-secret-change-me", "HS256");
      if (payload.role === "admin") isAdmin = true;
    } catch {}
  }

  if (!isAdmin && status !== "pending") {
    return c.json({
      error: "ValidationError",
      message: `Cannot cancel an order with status "${order.status}". Only Pending orders can be cancelled by the user.`,
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
  const orderItemsList = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id));
  for (const item of orderItemsList) {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, item.productId));
    if (product) {
      await db.update(schema.products)
        .set({
          soldCount: Math.max(0, (product.soldCount ?? 0) - item.quantity)
        })
        .where(eq(schema.products.id, item.productId));
    }
  }

  // Email customer about cancellation
  if (order.customerEmail && c.env.GOOGLE_SCRIPT_URL) {
    const cancellationPromise = sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: order.customerEmail,
      subject: `PlayPen House — Order ${order.invoiceId} Cancelled`,
      text: `Hi ${order.customerName}, your order ${order.invoiceId} has been cancelled.`,
      html: orderStatusUpdateEmailHtml(
        order.invoiceId!,
        order.customerName,
        "Cancelled",
        body.reason || "Cancelled by customer"
      ),
    }).catch(err => console.error("[EMAIL] Cancellation email failed:", err));

    if (c.executionCtx) c.executionCtx.waitUntil(cancellationPromise);
  }

  return c.json({
    message: "Order cancelled successfully.",
    _links: formatLinks(c, "/orders", id),
  });
});

ordersRouter.post("/:id/reopen", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json().catch(() => ({}));

  // Admin Check
  const authHeader = c.req.header("Authorization");
  const apiKey = c.env.ADMIN_API_KEY;
  let isAdmin = apiKey && authHeader === `Bearer ${apiKey}`;
  
  if (!isAdmin && authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const payload = await verify(token, c.env.JWT_SECRET || "fallback-dev-secret-change-me", "HS256");
      if (payload.role === "admin") isAdmin = true;
    } catch {}
  }

  if (!isAdmin) {
    return c.json({ error: "Unauthorized", message: "Only admins can re-open orders." }, 401);
  }

  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
  if (!order) throw new Error(`Order with ID ${id} not found`);

  if (order.status?.toLowerCase() !== "cancelled") {
    return c.json({
      error: "ValidationError",
      message: "Only cancelled orders can be re-opened.",
    }, 422);
  }

  // Check stock before re-opening
  const orderItemsList = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id));
  for (const item of orderItemsList) {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, item.productId));
    if (!product) throw new Error(`Product ${item.productId} not found`);
    
    const availableStock = (product.stock ?? 0) - (product.soldCount ?? 0);
    if (availableStock < item.quantity) {
      throw new Error(`Insufficient stock to re-open order. Product "${product.title}" only has ${availableStock} left.`);
    }
  }

  // Update order status back to Pending (or Processing)
  await db.update(schema.orders)
    .set({ status: "Pending" })
    .where(eq(schema.orders.id, id));

  // Restore soldCount (consume stock)
  for (const item of orderItemsList) {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, item.productId));
    await db.update(schema.products)
      .set({
        soldCount: (product!.soldCount ?? 0) + item.quantity
      })
      .where(eq(schema.products.id, item.productId));
  }

  // Add tracking entry
  await db.insert(schema.trackings).values({
    id: crypto.randomUUID(),
    orderId: id,
    status: "Order Re-opened",
    message: body.reason || "Order re-opened by administrator.",
    createdAt: new Date(),
  });

  return c.json({
    message: "Order re-opened successfully.",
    _links: formatLinks(c, "/orders", id),
  });
});
