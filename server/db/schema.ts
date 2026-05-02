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
