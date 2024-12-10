CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`expiresAt` integer,
	`password` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`firstName` text,
	`lastName` text,
	`email` text NOT NULL,
	`emailVerified` integer NOT NULL,
	`image` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE `user_keys`;--> statement-breakpoint
DROP TABLE `user_sessions`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `drivers` ADD `createdAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `drivers` ADD `updatedAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `drivers` DROP COLUMN `createdOn`;--> statement-breakpoint
ALTER TABLE `drivers` DROP COLUMN `updatedOn`;--> statement-breakpoint
ALTER TABLE `feeds` ADD `createdAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `feeds` ADD `updatedAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `feeds` DROP COLUMN `createdOn`;--> statement-breakpoint
ALTER TABLE `feeds` DROP COLUMN `updatedOn`;--> statement-breakpoint
ALTER TABLE `links` ADD `createdAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `links` ADD `updatedAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `links` DROP COLUMN `createdOn`;--> statement-breakpoint
ALTER TABLE `links` DROP COLUMN `updatedOn`;