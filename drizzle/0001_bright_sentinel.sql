CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`reservationId` int,
	`budgetNumber` varchar(50) NOT NULL,
	`status` enum('draft','sent','accepted','rejected','expired') NOT NULL DEFAULT 'draft',
	`eventDate` date NOT NULL,
	`deliveryFee` decimal(10,2) NOT NULL DEFAULT 0,
	`totalAmount` decimal(12,2) NOT NULL,
	`validUntil` date,
	`items` json,
	`notes` text,
	`sentViaWhatsapp` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`),
	CONSTRAINT `budgets_budgetNumber_unique` UNIQUE(`budgetNumber`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`whatsapp` varchar(20),
	`address` text,
	`city` varchar(100),
	`state` varchar(2),
	`zipCode` varchar(10),
	`totalSpent` decimal(12,2) NOT NULL DEFAULT 0,
	`totalReservations` int NOT NULL DEFAULT 0,
	`firstRentalDate` date,
	`lastRentalDate` date,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `company_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`ownerName` varchar(255),
	`email` varchar(320),
	`phone` varchar(20),
	`whatsapp` varchar(20),
	`address` text,
	`logoUrl` varchar(500),
	`logoKey` varchar(255),
	`website` varchar(255),
	`taxId` varchar(50),
	`bankAccount` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservationId` int NOT NULL,
	`clientId` int NOT NULL,
	`contractNumber` varchar(50) NOT NULL,
	`status` enum('draft','sent','signed','cancelled') NOT NULL DEFAULT 'draft',
	`signatureLink` varchar(500),
	`clientSignatureDate` timestamp,
	`clientSignatureName` varchar(255),
	`terms` text,
	`notes` text,
	`sentViaWhatsapp` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contracts_contractNumber_unique` UNIQUE(`contractNumber`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`expenseDate` date NOT NULL,
	`category` varchar(100) NOT NULL,
	`paymentMethod` varchar(50),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `income` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservationId` int,
	`description` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`incomeDate` date NOT NULL,
	`category` varchar(100),
	`status` enum('pending','received') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `income_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`toyId` int NOT NULL,
	`startDate` date NOT NULL,
	`expectedEndDate` date,
	`actualEndDate` date,
	`reason` varchar(255) NOT NULL,
	`description` text,
	`cost` decimal(10,2) NOT NULL DEFAULT 0,
	`status` enum('scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservationId` int NOT NULL,
	`toyId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`dailyPrice` decimal(10,2) NOT NULL,
	`rentalDays` int NOT NULL DEFAULT 1,
	`subtotal` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservation_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`eventDate` date NOT NULL,
	`eventTime` varchar(5),
	`eventAddress` text,
	`eventCity` varchar(100),
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`deliveryFee` decimal(10,2) NOT NULL DEFAULT 0,
	`totalAmount` decimal(12,2) NOT NULL,
	`depositAmount` decimal(12,2) NOT NULL DEFAULT 0,
	`remainingAmount` decimal(12,2) NOT NULL,
	`paymentStatus` enum('pending','partial','paid') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `toys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`photoUrl` varchar(500),
	`photoKey` varchar(255),
	`lengthCm` int,
	`widthCm` int,
	`heightCm` int,
	`quantityAvailable` int NOT NULL DEFAULT 0,
	`dailyRentalPrice` decimal(10,2) NOT NULL,
	`category` varchar(100),
	`isUnderMaintenance` boolean NOT NULL DEFAULT false,
	`maintenanceNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `toys_id` PRIMARY KEY(`id`)
);
