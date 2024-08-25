CREATE TABLE `drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`userId` text,
	`config` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE `feeds` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`url` text,
	`userId` text,
	`wxUid` text,
	`driver` text,
	`folderId` text,
	`folderName` text,
	`regexp` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text,
	`title` text,
	`feedId` integer,
	`wxUid` text,
	`userId` text,
	`driver` text,
	`folderId` text,
	`checked` integer,
	`saved` integer,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE `user_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`hashed_password` text,
	`createdOn` integer,
	`updatedOn` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`active_expires` integer NOT NULL,
	`idle_expires` integer NOT NULL,
	`createdOn` integer,
	`updatedOn` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`password` text,
	`wxUid` text,
	`role` text,
	`plan` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE INDEX `driverUserIdIndex` ON `drivers` (`userId`);--> statement-breakpoint
CREATE INDEX `feedUserIdIndex` ON `feeds` (`userId`);--> statement-breakpoint
CREATE INDEX `linkUserIdIndex` ON `links` (`userId`);--> statement-breakpoint
CREATE INDEX `linkPostIdIndex` ON `links` (`feedId`);