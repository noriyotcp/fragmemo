CREATE TABLE `app_state` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`active_snippet_id` text,
	`active_fragment_id` text,
	`sidebar_width` integer DEFAULT 300 NOT NULL,
	`window_bounds` text
);
--> statement-breakpoint
CREATE TABLE `fragments` (
	`id` text PRIMARY KEY NOT NULL,
	`snippet_id` text NOT NULL,
	`title` text,
	`content` text DEFAULT '' NOT NULL,
	`language` text DEFAULT 'plaintext' NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`snippet_id`) REFERENCES `snippets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`editor_font_size` integer DEFAULT 14 NOT NULL,
	`editor_font_family` text DEFAULT 'monospace' NOT NULL,
	`autosave` integer DEFAULT true NOT NULL,
	`export_path` text
);
--> statement-breakpoint
CREATE TABLE `snippets` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`tags` text DEFAULT '[]',
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
