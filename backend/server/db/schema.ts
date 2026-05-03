import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const banners = sqliteTable("banners", {
  id:       text("id").primaryKey(),
  image:    text("image").notNull(),
  link:     text("link"),
  position: text("position"),   // hero | mid-1 | mid-2
  order:    integer("order").default(0),
  isActive: integer("is_active").default(1),
});

export const categories = sqliteTable("categories", {
  id:         text("id").primaryKey(),
  name:       text("name").notNull(),
  slug:       text("slug").notNull().unique(),
  parentId:   text("parent_id"),
  image:      text("image"),
  isFeatured: integer("is_featured").default(0),
  isActive:   integer("is_active").default(1),
});

export const products = sqliteTable("products", {
  id:          text("id").primaryKey(),
  title:       text("title").notNull(),
  slug:        text("slug").notNull().unique(),
  categoryId:  text("category_id"),
  brand:       text("brand"),
  price:       real("price").notNull(),
  salePrice:   real("sale_price"),
  stock:       integer("stock").default(0),
  images:      text("images"),    // JSON string → string[]
  tags:        text("tags"),      // JSON string → string[]
  rating:      real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  isActive:    integer("is_active").default(1),
  createdAt:   integer("created_at", { mode: "timestamp" }),
});

export const orders = sqliteTable("orders", {
  id:              text("id").primaryKey(),
  invoiceId:       text("invoice_id").unique(),
  customerName:    text("customer_name").notNull(),
  customerEmail:   text("customer_email"),
  customerPhone:   text("customer_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  totalAmount:     real("total_amount").notNull(),
  status:          text("status").default("pending"), // pending, processing, shipped, delivered, cancelled
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
