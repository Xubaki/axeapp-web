CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`evento` varchar(100) NOT NULL,
	`userId` int,
	`propriedades` text,
	`plataforma` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_tokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
ALTER TABLE `terreiros` ADD `telefone` varchar(20);--> statement-breakpoint
ALTER TABLE `terreiros` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `terreiros` ADD `isVerified` tinyint DEFAULT 0 NOT NULL;