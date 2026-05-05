ALTER TABLE `coupons` ADD `applicable_type` text DEFAULT 'all' NOT NULL;--> statement-breakpoint
ALTER TABLE `coupons` ADD `applicable_ids` text;