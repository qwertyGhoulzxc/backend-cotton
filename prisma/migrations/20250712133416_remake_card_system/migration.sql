/*
  Warnings:

  - You are about to drop the column `ef` on the `card` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `card` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "card" DROP COLUMN "ef",
DROP COLUMN "priority";

-- CreateTable
CREATE TABLE "FSRS_card" (
    "id" TEXT NOT NULL,
    "due" TIMESTAMP(3) NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "elapsed_days" INTEGER NOT NULL,
    "scheduled_days" INTEGER NOT NULL,
    "learning_steps" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "lapses" INTEGER NOT NULL,
    "state" INTEGER NOT NULL,
    "last_review" TIMESTAMP(3),
    "cardId" TEXT NOT NULL,

    CONSTRAINT "FSRS_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FSRS_card_log" (
    "id" TEXT NOT NULL,
    "review" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER NOT NULL,
    "state" INTEGER NOT NULL,
    "due" TIMESTAMP(3) NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "elapsed_days" INTEGER NOT NULL,
    "last_elapsed_days" INTEGER NOT NULL,
    "scheduled_days" INTEGER NOT NULL,
    "learning_steps" INTEGER NOT NULL,
    "fsrsCardId" TEXT NOT NULL,

    CONSTRAINT "FSRS_card_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FSRS_card_cardId_key" ON "FSRS_card"("cardId");

-- AddForeignKey
ALTER TABLE "FSRS_card" ADD CONSTRAINT "FSRS_card_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FSRS_card_log" ADD CONSTRAINT "FSRS_card_log_fsrsCardId_fkey" FOREIGN KEY ("fsrsCardId") REFERENCES "FSRS_card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
