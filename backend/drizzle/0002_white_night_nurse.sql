ALTER TABLE `orders` ADD `payment_method` text DEFAULT 'cod';--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_phone` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_trx_id` text;