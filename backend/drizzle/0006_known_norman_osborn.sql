CREATE TABLE `consultas_orixas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orixaId` varchar(64) NOT NULL,
	`orixaNome` varchar(120) NOT NULL,
	`orixaEmoji` varchar(8) NOT NULL,
	`pergunta` text NOT NULL,
	`resposta` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consultas_orixas_id` PRIMARY KEY(`id`)
);
