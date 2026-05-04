import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id"), // can be null for all/broadcast
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // 'offer', 'order_status', 'info'
  isRead: integer("is_read").notNull().default(0),
  createdAt: text("created_at"),
});
