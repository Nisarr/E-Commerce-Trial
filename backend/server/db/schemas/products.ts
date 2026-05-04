// ── Products ─────────────────────────────────────────
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id:          text("id").primaryKey(),
  title:       text("title").notNull(),
  slug:        text("slug").notNull().unique(),
  categoryId:  text("category_id"),
  brand:       text("brand"),
  price:       real("price").notNull(),
  salePrice:   real("sale_price"),
  stock:       integer("stock").default(0),
  lowStockThreshold: integer("low_stock_threshold").default(5), // Alert when stock falls below
  images:      text("images"),    // JSON string → string[]
  tags:        text("tags"),      // JSON string → string[]
  rating:      real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  isActive:    integer("is_active").default(1),
  createdAt:   integer("created_at", { mode: "timestamp" }),
});
