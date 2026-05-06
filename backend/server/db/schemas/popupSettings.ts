// ── Popup Settings ────────────────────────────────────
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const popupSettings = sqliteTable("popup_settings", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  title:       text("title").notNull(),
  description: text("description").notNull(),
  buttonText:  text("button_text").notNull(),
  link:        text("link"), // Can be a product URL or any link
  imageUrl:    text("image_url"),
  isActive:    integer("is_active").default(1), // 1 for true, 0 for false
  updatedAt:   text("updated_at"),
});
