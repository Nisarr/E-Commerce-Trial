// ── Schema Barrel Export ─────────────────────────────
// All table schemas re-exported from a single entry point.
// Import from here: import * as schema from "./schemas"

export { banners } from "./banners";
export { categories } from "./categories";
export { products } from "./products";
export { orders, orderItems, trackings, ordersRelations, orderItemsRelations, trackingsRelations } from "./orders";
export { users } from "./users";
export { addresses } from "./addresses";
export { reviews } from "./reviews";
export { returns } from "./returns";
export { walletTransactions } from "./wallet";
export { otpCodes } from "./otp";
export { coupons } from "./coupons";
export { adminLogs } from "./adminLogs";
export { notifications } from "./notifications";
export { productSales } from "./productSales";
export { popupSettings } from "./popupSettings";
export { userInteractions, productSimilarity } from "./interactions";
export { systemCache } from "./cache";
export { systemSettings } from "./systemSettings";

