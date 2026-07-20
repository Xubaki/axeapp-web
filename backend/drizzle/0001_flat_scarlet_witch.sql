CREATE TABLE `depoimentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nomeAutor` varchar(120) NOT NULL,
	`tradicaoAutor` varchar(64),
	`texto` text NOT NULL,
	`curtidas` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `depoimentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `entradas_diario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emoji` varchar(8) NOT NULL DEFAULT '✨',
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `entradas_diario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `perfis_espirituais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nomeEspiritual` varchar(120),
	`orixaRegente` varchar(64),
	`orixaJunto` varchar(64),
	`tradicao` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `perfis_espirituais_id` PRIMARY KEY(`id`),
	CONSTRAINT `perfis_espirituais_userId_unique` UNIQUE(`userId`)
);
