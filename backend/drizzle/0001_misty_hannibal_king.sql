CREATE TABLE `addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`label` text,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`city` text,
	`postal_code` text,
	`is_default` integer DEFAULT 0,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `admin_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_id` text,
	`action` text NOT NULL,
	`entity` text,
	`entity_id` text,
	`details` text,
	`ip_address` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`value` real NOT NULL,
	`min_order_amount` real DEFAULT 0,
	`max_discount` real,
	`usage_limit` integer,
	`used_count` integer DEFAULT 0,
	`is_active` integer DEFAULT 1,
	`starts_at` integer,
	`expires_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text,
	`user_id` text,
	`customer_name` text NOT NULL,
	`customer_email` text,
	`customer_phone` text NOT NULL,
	`shipping_address` text NOT NULL,
	`total_amount` real NOT NULL,
	`status` text DEFAULT 'pending',
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_invoice_id_unique` ON `orders` (`invoice_id`);--> statement-breakpoint
CREATE TABLE `otp_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`code` text NOT NULL,
	`type` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used` integer DEFAULT 0,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `returns` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`user_id` text NOT NULL,
	`reason` text NOT NULL,
	`details` text,
	`images` text,
	`status` text DEFAULT 'Requested',
	`type` text NOT NULL,
	`admin_notes` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`rating` integer NOT NULL,
	`title` text,
	`content` text,
	`images` text,
	`is_verified` integer DEFAULT 0,
	`status` text DEFAULT 'approved',
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `trackings` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`status` text NOT NULL,
	`message` text,
	`location` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`phone` text,
	`password_hash` text NOT NULL,
	`full_name` text,
	`avatar` text,
	`role` text DEFAULT 'user',
	`is_verified` integer DEFAULT 0,
	`is_blocked` integer DEFAULT 0,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `wallet_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`reference` text,
	`balance_after` real,
	`created_at` integer
);
--> statement-breakpoint
ALTER TABLE `categories` ADD `is_active` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `products` ADD `low_stock_threshold` integer DEFAULT 5;