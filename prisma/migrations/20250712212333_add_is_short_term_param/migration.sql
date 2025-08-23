/*
  Warnings:

  - You are about to drop the column `deckId` on the `deck_session` table. All the data in the column will be lost.
  - You are about to drop the `fsrs_weights` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[deck_id]` on the table `deck_session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deck_id` to the `deck_session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "deck_session" DROP CONSTRAINT "deck_session_deckId_fkey";

-- DropForeignKey
ALTER TABLE "fsrs_weights" DROP CONSTRAINT "fsrs_weights_category_id_fkey";

-- DropIndex
DROP INDEX "deck_session_deckId_key";

-- DropIndex
DROP INDEX "deck_session_mastery_deckId_idx";

-- DropIndex
DROP INDEX "deck_session_updated_at_deckId_idx";

-- AlterTable
ALTER TABLE "deck_session" DROP COLUMN "deckId",
ADD COLUMN     "deck_id" TEXT NOT NULL,
ADD COLUMN     "is_short_term" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "fsrs_weights";

-- CreateTable
CREATE TABLE "FSRS_weights" (
    "id" TEXT NOT NULL,
    "w" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "FSRS_weights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FSRS_weights_category_id_key" ON "FSRS_weights"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "deck_session_deck_id_key" ON "deck_session"("deck_id");

-- CreateIndex
CREATE INDEX "deck_session_mastery_deck_id_idx" ON "deck_session"("mastery", "deck_id");

-- CreateIndex
CREATE INDEX "deck_session_updated_at_deck_id_idx" ON "deck_session"("updated_at", "deck_id");

-- AddForeignKey
ALTER TABLE "FSRS_weights" ADD CONSTRAINT "FSRS_weights_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "deck_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_session" ADD CONSTRAINT "deck_session_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
