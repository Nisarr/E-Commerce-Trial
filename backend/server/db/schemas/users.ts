// ── Users ────────────────────────────────────────────
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id:           text("id").primaryKey(),
  username:     text("username").notNull().unique(),
  email:        text("email").unique(),
  phone:        text("phone"),
  passwordHash: text("password_hash").notNull(),
  fullName:     text("full_name"),
  avatar:       text("avatar"),
  role:         text("role").default("user"),         // "user" | "admin"
  isVerified:   integer("is_verified").default(0),
  isBlocked:    integer("is_blocked").default(0),     // 0 = active, 1 = blocked
  createdAt:    integer("created_at", { mode: "timestamp" }),
});
