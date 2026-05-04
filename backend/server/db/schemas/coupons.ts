// ── Coupons / Discount Codes ─────────────────────────
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const coupons = sqliteTable("coupons", {
  id:           text("id").primaryKey(),
  code:         text("code").notNull().unique(),           // e.g. "SAVE10"
  description:  text("description"),                       // Readable label
  type:         text("type").notNull(),                    // "percentage" | "fixed"
  value:        real("value").notNull(),                   // 10 (%) or 5.00 ($)
  minOrderAmount: real("min_order_amount").default(0),     // Minimum order to apply
  maxDiscount:  real("max_discount"),                      // Cap for percentage coupons
  usageLimit:   integer("usage_limit"),                    // null = unlimited
  usedCount:    integer("used_count").default(0),
  isActive:     integer("is_active").default(1),           // 0 = disabled
  startsAt:     integer("starts_at", { mode: "timestamp" }),
  expiresAt:    integer("expires_at", { mode: "timestamp" }),
  createdAt:    integer("created_at", { mode: "timestamp" }),
});
