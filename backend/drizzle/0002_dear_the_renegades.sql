CREATE TABLE `curtidas_depoimentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`depoimentoId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `curtidas_depoimentos_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_curtida` UNIQUE(`userId`,`depoimentoId`)
);
--> statement-breakpoint
CREATE TABLE `denuncias_depoimentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`depoimentoId` int NOT NULL,
	`motivo` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `denuncias_depoimentos_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_denuncia` UNIQUE(`userId`,`depoimentoId`)
);
--> statement-breakpoint
ALTER TABLE `depoimentos` ADD `categoria` enum('todos','experiencias','sonhos','agradecimentos','duvidas','oferendas','pontos') DEFAULT 'experiencias' NOT NULL;--> statement-breakpoint
ALTER TABLE `depoimentos` ADD `denuncias` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `depoimentos` ADD `oculto` int DEFAULT 0 NOT NULL;