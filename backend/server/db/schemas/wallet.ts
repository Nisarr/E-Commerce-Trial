// ── Wallet Transactions ──────────────────────────────
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const walletTransactions = sqliteTable("wallet_transactions", {
  id:        text("id").primaryKey(),
  userId:    text("user_id").notNull(),
  amount:    real("amount").notNull(),
  type:      text("type").notNull(),       // "credit" | "debit"
  reference: text("reference"),            // e.g. "Refund for order #INV-XXX", "Top-up"
  balanceAfter: real("balance_after"),     // Running balance after this txn
  createdAt: integer("created_at", { mode: "timestamp" }),
});
