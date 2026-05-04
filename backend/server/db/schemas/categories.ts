// ── Categories ───────────────────────────────────────
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id:         text("id").primaryKey(),
  name:       text("name").notNull(),
  slug:       text("slug").notNull().unique(),
  parentId:   text("parent_id"),
  image:      text("image"),
  isFeatured: integer("is_featured").default(0),
  isActive:   integer("is_active").default(1),
});
