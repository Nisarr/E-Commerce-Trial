import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const orders = sqliteTable("orders", {
  id:              text("id").primaryKey(),
  invoiceId:       text("invoice_id").unique(),
  userId:          text("user_id"),              // links to users table (nullable for guest checkout)
  customerName:    text("customer_name").notNull(),
  customerEmail:   text("customer_email"),
  customerPhone:   text("customer_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  totalAmount:     real("total_amount").notNull(),
  status:          text("status").default("pending"), // pending, processing, shipped, delivered, cancelled
  paymentMethod:   text("payment_method").default("cod"), // cod, bkash, nagad, wallet
  paymentPhone:    text("payment_phone"), // phone number used to send money
  paymentTrxId:    text("payment_trx_id"), // bKash/Nagad transaction ID
  internalNote:    text("internal_note"), // admin-only notes
  courierId:       text("courier_id"),    // e.g. Pathao/Steadfast ID
  courierLink:     text("courier_link"),  // link to tracking
  createdAt:       integer("created_at", { mode: "timestamp" }),
});

export const orderItems = sqliteTable("order_items", {
  id:        text("id").primaryKey(),
  orderId:   text("order_id").notNull(),
  productId: text("product_id").notNull(),
  quantity:  integer("quantity").notNull(),
  price:     real("price").notNull(),
});

export const trackings = sqliteTable("trackings", {
  id:        text("id").primaryKey(),
  orderId:   text("order_id").notNull(),
  status:    text("status").notNull(), // Order Placed, Processing, Shipped, Out for Delivery, Delivered
  message:   text("message"),
  location:  text("location"),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

// ── Relations ──────────────────────────────────────────
export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  trackings: many(trackings),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const trackingsRelations = relations(trackings, ({ one }) => ({
  order: one(orders, {
    fields: [trackings.orderId],
    references: [orders.id],
  }),
}));
