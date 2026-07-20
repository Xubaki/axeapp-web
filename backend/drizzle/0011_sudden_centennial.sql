CREATE TABLE `parceiro_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nomeTerreiro` varchar(200) NOT NULL,
	`tradicao` varchar(100) NOT NULL,
	`estado` varchar(2) NOT NULL,
	`dirigente` varchar(200) NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`email` varchar(320),
	`plano` varchar(100) NOT NULL DEFAULT 'Parceiro Fundador (Ouro por R$ 29,90/mês)',
	`status` enum('novo','contatado','convertido','descartado') NOT NULL DEFAULT 'novo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parceiro_leads_id` PRIMARY KEY(`id`)
);
