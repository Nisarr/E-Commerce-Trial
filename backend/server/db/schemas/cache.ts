
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const systemCache = sqliteTable("system_cache", {
  key: text("key").primaryKey(),
  data: text("data").notNull(), // Store pre-formatted JSON
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
