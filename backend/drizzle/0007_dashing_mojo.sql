CREATE TABLE `assinaturas_premium` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plano` enum('mensal','anual','avulso') NOT NULL,
	`sku` varchar(128) NOT NULL,
	`plataforma` enum('android','ios') NOT NULL,
	`transactionId` varchar(256) NOT NULL,
	`status` enum('ativo','expirado','cancelado') NOT NULL DEFAULT 'ativo',
	`dataInicio` timestamp NOT NULL DEFAULT (now()),
	`dataExpiracao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assinaturas_premium_id` PRIMARY KEY(`id`),
	CONSTRAINT `assinaturas_premium_transactionId_unique` UNIQUE(`transactionId`)
);
