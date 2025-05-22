/*
  Warnings:

  - The values [RESOLVED,CLOSED] on the enum `Dispute_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Dispute` MODIFY `status` ENUM('OPEN', 'IN_REVIEW', 'RESOLVED_CLIENT', 'RESOLVED_PROVIDER', 'RESOLVED_PARTIAL', 'CANCELED') NOT NULL DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE `DisputeReply` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `disputeId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `attachments` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DisputeReply_disputeId_idx`(`disputeId`),
    INDEX `DisputeReply_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DisputeReply` ADD CONSTRAINT `DisputeReply_disputeId_fkey` FOREIGN KEY (`disputeId`) REFERENCES `Dispute`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DisputeReply` ADD CONSTRAINT `DisputeReply_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
