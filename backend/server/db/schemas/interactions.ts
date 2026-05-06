
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const userInteractions = sqliteTable("user_interactions", {
  id: text("id").primaryKey(),
  userId: text("user_id"), // Can be null for guests
  sessionId: text("session_id"), // To track guests
  productId: text("product_id").notNull(),
  interactionType: text("interaction_type").notNull(), // 'view', 'add_to_cart', 'purchase'
  weight: integer("weight").notNull().default(1), // view=1, cart=3, purchase=10
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Table to store pre-calculated product similarity scores for fast retrieval
export const productSimilarity = sqliteTable("product_similarity", {
  id: text("id").primaryKey(),
  productA: text("product_a").notNull(),
  productB: text("product_b").notNull(),
  score: real("score").notNull(), // Similarity score
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
