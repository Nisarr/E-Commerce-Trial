ALTER TABLE `products` ADD `highlights` text;--> statement-breakpoint
ALTER TABLE `products` ADD `how_it_works` text;--> statement-breakpoint
ALTER TABLE `products` ADD `benefits` text;--> statement-breakpoint
ALTER TABLE `products` ADD `video_url` text;--> statement-breakpoint
ALTER TABLE `products` ADD `faqs` text;--> statement-breakpoint
ALTER TABLE `products` ADD `spec_sheet_url` text;--> statement-breakpoint
ALTER TABLE `products` ADD `comparison_data` text;--> statement-breakpoint
ALTER TABLE `products` ADD `bundle_products` text;--> statement-breakpoint
ALTER TABLE `products` ADD `qna` text;--> statement-breakpoint
ALTER TABLE `products` ADD `delivery_info` text;--> statement-breakpoint
ALTER TABLE `products` ADD `warranty_info` text;--> statement-breakpoint
ALTER TABLE `products` ADD `offer_deadline` integer;--> statement-breakpoint
ALTER TABLE `products` ADD `trust_badges` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `helpful_count` integer DEFAULT 0;