// ── Returns & Cancellations ──────────────────────────
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const returns = sqliteTable("returns", {
  id:         text("id").primaryKey(),
  orderId:    text("order_id").notNull(),
  userId:     text("user_id").notNull(),
  reason:     text("reason").notNull(),
  details:    text("details"),                      // Additional text from user
  images:     text("images"),                       // Evidence images (JSON string → string[])
  status:     text("status").default("Requested"),  // Requested, Approved, Rejected, Completed
  type:       text("type").notNull(),               // "return" | "cancellation"
  adminNotes: text("admin_notes"),                  // Admin response
  createdAt:  integer("created_at", { mode: "timestamp" }),
});
