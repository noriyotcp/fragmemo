CREATE TABLE `fragment_states` (
	`fragment_id` text PRIMARY KEY NOT NULL,
	`view_state` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`fragment_id`) REFERENCES `fragments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `fragments` DROP COLUMN `view_state`;--> statement-breakpoint
-- Note: SQLite doesn't support adding NOT NULL columns with non-constant defaults to existing tables
-- For dev, we'll add it as nullable first, then update existing rows, then make it NOT NULL via recreate
-- But since we're in dev and can reset, we're adding manually created column definition
-- If this fails, manually delete the DB and restart
ALTER TABLE `fragments` ADD `updated_at` integer DEFAULT (unixepoch());
