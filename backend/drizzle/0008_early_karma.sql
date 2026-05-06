CREATE TABLE `popup_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`button_text` text NOT NULL,
	`link` text,
	`image_url` text,
	`is_active` integer DEFAULT 1,
	`updated_at` text
);
