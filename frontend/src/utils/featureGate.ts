// ═══════════════════════════════════════════════════════════════
// PlayPen House — Feature Gate Registry
// Controlled by Orbit SaaS License System
// ═══════════════════════════════════════════════════════════════

/**
 * Every premium-only feature gets a unique key.
 * These keys are used by <PremiumGate> and useLicenseStore
 * to determine whether a feature should be accessible.
 */
export type FeatureKey =
  // ── Admin Dashboard ──────────────────────────
  | 'dashboard.revenue'
  | 'dashboard.charts'
  | 'dashboard.timeline'
  | 'dashboard.lowStock'
  | 'dashboard.recentOrders'
  // ── Admin Modules (entire pages) ─────────────
  | 'admin.banners'
  | 'admin.specialOffers'
  | 'admin.bestSelling'
  | 'admin.newArrivals'
  | 'admin.customers'
  | 'admin.notifications'
  | 'admin.reviews'
  | 'admin.returns'
  | 'admin.coupons'
  | 'admin.popup'
  | 'admin.productBuyers'
  // ── Admin Settings sub-features ──────────────
  | 'settings.email'
  | 'settings.payments'
  // ── System ───────────────────────────────────
  // (Cache is now available in trial)
  // ── Orders sub-features ──────────────────────
  | 'orders.emailNotify'
  | 'orders.bulkExport'
  | 'orders.invoice'
  // ── Storefront ───────────────────────────────
  | 'storefront.promoBanners'
  | 'storefront.popup'
  | 'storefront.specialOfferCountdown'
  // ── User Account ─────────────────────────────
  | 'account.reviews'
  | 'account.returns'
  | 'account.cancellations'
  | 'account.wallet'
  | 'account.payments'
  | 'account.notifications';

/**
 * Admin sidebar tab IDs that are premium-only.
 * Used by Sidebar.tsx to show lock icons and prevent navigation.
 */
export const PREMIUM_SIDEBAR_IDS = new Set([
  'banners',
  'special-offers',
  'best-selling',
  'new-arrivals',
  'customers',
  'notifications',
  'reviews',
  'returns',
  'coupons',
  'popup',
]);

/**
 * Maps admin sidebar tab IDs → FeatureKey for PremiumGate usage.
 */
export const SIDEBAR_FEATURE_MAP: Record<string, FeatureKey> = {
  'banners': 'admin.banners',
  'special-offers': 'admin.specialOffers',
  'best-selling': 'admin.bestSelling',
  'new-arrivals': 'admin.newArrivals',
  'customers': 'admin.customers',
  'notifications': 'admin.notifications',
  'reviews': 'admin.reviews',
  'returns': 'admin.returns',
  'coupons': 'admin.coupons',
  'popup': 'admin.popup',
};

/**
 * Orbit SaaS contact URL for upgrade CTA.
 */
export const ORBIT_SAAS_URL = 'https://orbitsaas.cloud/';
