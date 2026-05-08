-- ============================================
-- Remaining D1 Migrations (0009 → 0016)
-- Paste this ENTIRE block into the Cloudflare
-- Dashboard D1 Console and click "Execute"
-- ============================================

-- 0009: Product overview & specification
ALTER TABLE `products` ADD `overview` text;
ALTER TABLE `products` ADD `specification` text;

-- 0010: Extended product fields + review helpful count
ALTER TABLE `products` ADD `highlights` text;
ALTER TABLE `products` ADD `how_it_works` text;
ALTER TABLE `products` ADD `benefits` text;
ALTER TABLE `products` ADD `video_url` text;
ALTER TABLE `products` ADD `faqs` text;
ALTER TABLE `products` ADD `spec_sheet_url` text;
ALTER TABLE `products` ADD `comparison_data` text;
ALTER TABLE `products` ADD `bundle_products` text;
ALTER TABLE `products` ADD `qna` text;
ALTER TABLE `products` ADD `delivery_info` text;
ALTER TABLE `products` ADD `warranty_info` text;
ALTER TABLE `products` ADD `offer_deadline` integer;
ALTER TABLE `products` ADD `trust_badges` text;
ALTER TABLE `reviews` ADD `helpful_count` integer DEFAULT 0;

-- 0011: Recommendation engine tables
CREATE TABLE `product_similarity` (
	`id` text PRIMARY KEY NOT NULL,
	`product_a` text NOT NULL,
	`product_b` text NOT NULL,
	`score` real NOT NULL,
	`updated_at` integer NOT NULL
);
CREATE TABLE `user_interactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`session_id` text,
	`product_id` text NOT NULL,
	`interaction_type` text NOT NULL,
	`weight` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL
);

-- 0012: System cache table
CREATE TABLE `system_cache` (
	`key` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer NOT NULL
);

-- 0013: System settings + product updated_at
CREATE TABLE `system_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
CREATE UNIQUE INDEX `system_settings_key_unique` ON `system_settings` (`key`);
ALTER TABLE `products` ADD `updated_at` integer;

-- 0014: Order courier fields
ALTER TABLE `orders` ADD `internal_note` text;
ALTER TABLE `orders` ADD `courier_id` text;
ALTER TABLE `orders` ADD `courier_link` text;

-- 0015: Notification order reference
ALTER TABLE `notifications` ADD `order_id` text;

-- 0016: Review order reference
ALTER TABLE `reviews` ADD `order_id` text;
