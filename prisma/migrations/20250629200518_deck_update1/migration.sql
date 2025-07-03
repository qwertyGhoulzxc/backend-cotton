/*
  Warnings:

  - You are about to drop the column `cardCount` on the `deck` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "deck" DROP COLUMN "cardCount",
ADD COLUMN     "card_count" INTEGER NOT NULL DEFAULT 0;
