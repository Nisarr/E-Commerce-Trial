import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const productSales = sqliteTable("product_sales", {
  id:              text("id").primaryKey(),
  productId:       text("product_id").notNull(),
  orderId:         text("order_id").notNull(),
  userId:          text("user_id"),
  customerName:    text("customer_name").notNull(),
  customerEmail:   text("customer_email"),
  customerPhone:   text("customer_phone").notNull(),
  invoiceId:       text("invoice_id").notNull(),
  price:           real("price").notNull(),
  quantity:        integer("quantity").notNull(),
  total:           real("total").notNull(),
  createdAt:       integer("created_at", { mode: "timestamp" }),
});
