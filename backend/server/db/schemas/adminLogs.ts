// ── Admin Activity Logs ──────────────────────────────
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const adminLogs = sqliteTable("admin_logs", {
  id:        text("id").primaryKey(),
  adminId:   text("admin_id"),                     // Who performed the action
  action:    text("action").notNull(),             // e.g. "order.approve", "review.flag", "user.block"
  entity:    text("entity"),                       // e.g. "order", "review", "user", "product"
  entityId:  text("entity_id"),                    // ID of the affected record
  details:   text("details"),                      // JSON or free-text description
  ipAddress: text("ip_address"),
  createdAt: integer("created_at", { mode: "timestamp" }),
});
