// ── Master Schema ────────────────────────────────────
// Re-exports everything from the organized schemas/ folder.
// This file exists for backward compatibility — all existing
// imports of `../../backend/server/db/schema` continue to work.
//
// Individual schemas live in ./schemas/*.ts

export {
  banners,
  categories,
  products,
  orders,
  orderItems,
  trackings,
  users,
  addresses,
  reviews,
  returns,
  walletTransactions,
  otpCodes,
  coupons,
  adminLogs,
  notifications,
  productSales,
  popupSettings,
  userInteractions,
  productSimilarity,
  systemCache,
  systemSettings,
} from "./schemas";
