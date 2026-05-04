// ── Banners ──────────────────────────────────────────
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const banners = sqliteTable("banners", {
  id:       text("id").primaryKey(),
  image:    text("image").notNull(),
  link:     text("link"),
  position: text("position"),   // hero | mid-1 | mid-2
  order:    integer("order").default(0),
  isActive: integer("is_active").default(1),
});
