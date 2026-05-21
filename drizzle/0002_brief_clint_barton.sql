ALTER TABLE `clients` MODIFY COLUMN `totalReservations` varchar(10) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `reservation_items` MODIFY COLUMN `rentalDays` varchar(10) NOT NULL DEFAULT '1';--> statement-breakpoint
ALTER TABLE `toys` MODIFY COLUMN `lengthCm` varchar(10);--> statement-breakpoint
ALTER TABLE `toys` MODIFY COLUMN `widthCm` varchar(10);--> statement-breakpoint
ALTER TABLE `toys` MODIFY COLUMN `heightCm` varchar(10);