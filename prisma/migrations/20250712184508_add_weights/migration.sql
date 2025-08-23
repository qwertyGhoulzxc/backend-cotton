/*
  Warnings:

  - You are about to drop the column `cardId` on the `FSRS_card` table. All the data in the column will be lost.
  - You are about to drop the column `fsrsCardId` on the `FSRS_card_log` table. All the data in the column will be lost.
  - You are about to drop the column `deckId` on the `card` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[card_id]` on the table `FSRS_card` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `card_id` to the `FSRS_card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fsrs_card_id` to the `FSRS_card_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deck_id` to the `card` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FSRS_card" DROP CONSTRAINT "FSRS_card_cardId_fkey";

-- DropForeignKey
ALTER TABLE "FSRS_card_log" DROP CONSTRAINT "FSRS_card_log_fsrsCardId_fkey";

-- DropForeignKey
ALTER TABLE "card" DROP CONSTRAINT "card_deckId_fkey";

-- DropIndex
DROP INDEX "FSRS_card_cardId_key";

-- AlterTable
ALTER TABLE "FSRS_card" DROP COLUMN "cardId",
ADD COLUMN     "card_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FSRS_card_log" DROP COLUMN "fsrsCardId",
ADD COLUMN     "fsrs_card_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "card" DROP COLUMN "deckId",
ADD COLUMN     "deck_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "fsrs_weights" (
    "id" TEXT NOT NULL,
    "w" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "fsrs_weights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fsrs_weights_category_id_key" ON "fsrs_weights"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "FSRS_card_card_id_key" ON "FSRS_card"("card_id");

-- AddForeignKey
ALTER TABLE "fsrs_weights" ADD CONSTRAINT "fsrs_weights_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "deck_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "card_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FSRS_card" ADD CONSTRAINT "FSRS_card_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FSRS_card_log" ADD CONSTRAINT "FSRS_card_log_fsrs_card_id_fkey" FOREIGN KEY ("fsrs_card_id") REFERENCES "FSRS_card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
