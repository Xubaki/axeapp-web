CREATE TABLE `community_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topicosQuentes` text NOT NULL,
	`tomGeral` varchar(240) NOT NULL,
	`sugestoesLinguagem` text NOT NULL,
	`totalDepoimentosAnalisados` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_insights_id` PRIMARY KEY(`id`)
);
