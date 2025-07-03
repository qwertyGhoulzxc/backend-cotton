/*
  Warnings:

  - You are about to drop the column `category` on the `deck` table. All the data in the column will be lost.
  - You are about to drop the column `mastery` on the `deck` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `deck` table. All the data in the column will be lost.
  - Added the required column `deck_category_id` to the `deck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `deck` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "deck" DROP CONSTRAINT "deck_userId_fkey";

-- AlterTable
ALTER TABLE "deck" DROP COLUMN "category",
DROP COLUMN "mastery",
DROP COLUMN "userId",
ADD COLUMN     "deck_category_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DeckCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DeckCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeckSession" (
    "id" TEXT NOT NULL,
    "mastery" INTEGER NOT NULL DEFAULT 0,
    "totalTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deckId" TEXT NOT NULL,

    CONSTRAINT "DeckSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeckCategory_name_key" ON "DeckCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DeckSession_deckId_key" ON "DeckSession"("deckId");

-- AddForeignKey
ALTER TABLE "deck" ADD CONSTRAINT "deck_deck_category_id_fkey" FOREIGN KEY ("deck_category_id") REFERENCES "DeckCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck" ADD CONSTRAINT "deck_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckSession" ADD CONSTRAINT "DeckSession_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
