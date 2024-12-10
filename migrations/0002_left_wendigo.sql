ALTER TABLE `session` ADD `token` text;--> statement-breakpoint
ALTER TABLE `session` ADD `createdAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `session` ADD `updatedAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `role` text;