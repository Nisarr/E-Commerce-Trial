CREATE TABLE `banners` (
	`id` text PRIMARY KEY NOT NULL,
	`image` text NOT NULL,
	`link` text,
	`position` text,
	`order` integer DEFAULT 0,
	`is_active` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`parent_id` text,
	`image` text,
	`is_featured` integer DEFAULT 0
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`category_id` text,
	`brand` text,
	`price` real NOT NULL,
	`sale_price` real,
	`stock` integer DEFAULT 0,
	`images` text,
	`tags` text,
	`rating` real DEFAULT 0,
	`review_count` integer DEFAULT 0,
	`is_active` integer DEFAULT 1,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);