CREATE TABLE `terreiros` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(200) NOT NULL,
	`tradicao` varchar(100) NOT NULL,
	`dirigente` varchar(200),
	`descricao` text,
	`endereco` varchar(400),
	`cidade` varchar(100) NOT NULL,
	`estado` varchar(2) NOT NULL,
	`whatsapp` varchar(20),
	`instagram` varchar(100),
	`latitude` varchar(20),
	`longitude` varchar(20),
	`plano` enum('livre','prata','ouro','diamante') NOT NULL DEFAULT 'livre',
	`ativo` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `terreiros_id` PRIMARY KEY(`id`)
);
