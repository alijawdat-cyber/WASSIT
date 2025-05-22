-- RenameIndex
ALTER TABLE `Dispute` RENAME INDEX `Dispute_clientId_fkey` TO `Dispute_clientId_idx`;

-- RenameIndex
ALTER TABLE `Dispute` RENAME INDEX `Dispute_providerId_fkey` TO `Dispute_providerId_idx`;

-- RenameIndex
ALTER TABLE `Message` RENAME INDEX `Message_fromUserId_fkey` TO `Message_fromUserId_idx`;

-- RenameIndex
ALTER TABLE `Message` RENAME INDEX `Message_requestId_fkey` TO `Message_requestId_idx`;

-- RenameIndex
ALTER TABLE `Message` RENAME INDEX `Message_toUserId_fkey` TO `Message_toUserId_idx`;

-- RenameIndex
ALTER TABLE `Offer` RENAME INDEX `Offer_providerId_fkey` TO `Offer_providerId_idx`;

-- RenameIndex
ALTER TABLE `Offer` RENAME INDEX `Offer_requestId_fkey` TO `Offer_requestId_idx`;

-- RenameIndex
ALTER TABLE `ProviderDoc` RENAME INDEX `ProviderDoc_userId_fkey` TO `ProviderDoc_userId_idx`;

-- RenameIndex
ALTER TABLE `Rating` RENAME INDEX `Rating_fromUserId_fkey` TO `Rating_fromUserId_idx`;

-- RenameIndex
ALTER TABLE `Rating` RENAME INDEX `Rating_requestId_fkey` TO `Rating_requestId_idx`;

-- RenameIndex
ALTER TABLE `Rating` RENAME INDEX `Rating_toUserId_fkey` TO `Rating_toUserId_idx`;

-- RenameIndex
ALTER TABLE `Request` RENAME INDEX `Request_clientId_fkey` TO `Request_clientId_idx`;

-- RenameIndex
ALTER TABLE `Request` RENAME INDEX `Request_serviceId_fkey` TO `Request_serviceId_idx`;
