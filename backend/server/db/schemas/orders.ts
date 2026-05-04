// ── Orders & Order Items & Trackings ─────────────────
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

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
