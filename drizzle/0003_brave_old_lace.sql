CREATE TABLE `budget_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientWhatsapp` varchar(20) NOT NULL,
	`eventDate` date NOT NULL,
	`eventEndDate` date,
	`location` text,
	`selectedToys` json NOT NULL,
	`totalEstimatedValue` decimal(10,2),
	`additionalNotes` text,
	`status` enum('pending','contacted','quoted','accepted','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_requests_id` PRIMARY KEY(`id`)
);
