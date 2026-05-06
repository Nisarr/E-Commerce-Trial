// ── Products ─────────────────────────────────────────
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id:          text("id").primaryKey(),
  title:       text("title").notNull(),
  slug:        text("slug").notNull().unique(),
  categoryId:  text("category_id"),
  brand:       text("brand"),
  price:       real("price").notNull(),
  salePrice:   real("sale_price"),
  stock:       integer("stock").default(0),
  lowStockThreshold: integer("low_stock_threshold").default(5), // Alert when stock falls below
  images:      text("images"),    // JSON string → string[]
  tags:        text("tags"),      // JSON string → string[]
  rating:      real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  soldCount:   integer("sold_count").default(0),
  overview:    text("overview"),
  specification: text("specification"),
  highlights:   text("highlights"),    // JSON string -> { icon, title, description }[]
  howItWorks:   text("how_it_works"), // JSON string -> { step, title, description }[]
  benefits:     text("benefits"),      // JSON string -> string[]
  videoUrl:     text("video_url"),
  faqs:         text("faqs"),          // JSON string -> { question, answer }[]
  specSheetUrl: text("spec_sheet_url"),
  comparisonData: text("comparison_data"), // JSON string -> { headers: string[], rows: string[][] }
  bundleProducts: text("bundle_products"), // JSON string -> string[] (product IDs)
  qna:          text("qna"),           // JSON string -> { question, answer, date }[]
  deliveryInfo: text("delivery_info"), // Short text like "৩-৫ দিনে ডেলিভারি"
  warrantyInfo: text("warranty_info"), // Short text like "1 Year Warranty"
  offerDeadline: integer("offer_deadline", { mode: "timestamp" }), // Countdown timer deadline
  trustBadges:  text("trust_badges"),  // JSON string -> { icon, label }[]
  isActive:    integer("is_active").default(1),
  createdAt:   integer("created_at", { mode: "timestamp" }),
  updatedAt:   integer("updated_at", { mode: "timestamp" }),
});
