// ── OTP Codes ────────────────────────────────────────
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const otpCodes = sqliteTable("otp_codes", {
  id:        text("id").primaryKey(),
  userId:    text("user_id").notNull(),
  code:      text("code").notNull(),         // 6-digit code
  type:      text("type").notNull(),         // "email_verify" | "password_reset"
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  metadata:  text("metadata"),                  // JSON string for pending data
  used:      integer("used").default(0),     // 0 or 1
  createdAt: integer("created_at", { mode: "timestamp" }),
});
