/*
  Warnings:

  - You are about to drop the `DeckCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DeckSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeckSession" DROP CONSTRAINT "DeckSession_deckId_fkey";

-- DropForeignKey
ALTER TABLE "deck" DROP CONSTRAINT "deck_deck_category_id_fkey";

-- DropTable
DROP TABLE "DeckCategory";

-- DropTable
DROP TABLE "DeckSession";

-- CreateTable
CREATE TABLE "deck_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deck_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_session" (
    "id" TEXT NOT NULL,
    "mastery" INTEGER NOT NULL DEFAULT 0,
    "totalTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deckId" TEXT NOT NULL,

    CONSTRAINT "deck_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deck_category_name_key" ON "deck_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "deck_session_deckId_key" ON "deck_session"("deckId");

-- AddForeignKey
ALTER TABLE "deck" ADD CONSTRAINT "deck_deck_category_id_fkey" FOREIGN KEY ("deck_category_id") REFERENCES "deck_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_session" ADD CONSTRAINT "deck_session_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
