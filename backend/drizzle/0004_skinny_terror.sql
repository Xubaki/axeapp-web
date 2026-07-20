CREATE TABLE `comentarios_depoimentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`depoimentoId` int NOT NULL,
	`userId` int,
	`nomeAutor` varchar(120) NOT NULL,
	`tradicaoAutor` varchar(64),
	`texto` text NOT NULL,
	`curtidas` int NOT NULL DEFAULT 0,
	`denuncias` int NOT NULL DEFAULT 0,
	`oculto` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comentarios_depoimentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `curtidas_comentarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`comentarioId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `curtidas_comentarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_curtida_comentario` UNIQUE(`userId`,`comentarioId`)
);
--> statement-breakpoint
CREATE TABLE `denuncias_comentarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`comentarioId` int NOT NULL,
	`motivo` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `denuncias_comentarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_denuncia_comentario` UNIQUE(`userId`,`comentarioId`)
);
