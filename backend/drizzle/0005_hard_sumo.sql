CREATE TABLE `product_sales` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`order_id` text NOT NULL,
	`user_id` text,
	`customer_name` text NOT NULL,
	`customer_email` text,
	`customer_phone` text NOT NULL,
	`invoice_id` text NOT NULL,
	`price` real NOT NULL,
	`quantity` integer NOT NULL,
	`total` real NOT NULL,
	`created_at` integer
);
