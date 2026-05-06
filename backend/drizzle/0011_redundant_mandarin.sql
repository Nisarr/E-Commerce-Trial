CREATE TABLE `product_similarity` (
	`id` text PRIMARY KEY NOT NULL,
	`product_a` text NOT NULL,
	`product_b` text NOT NULL,
	`score` real NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_interactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`session_id` text,
	`product_id` text NOT NULL,
	`interaction_type` text NOT NULL,
	`weight` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL
);
