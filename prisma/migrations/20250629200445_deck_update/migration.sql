/*
  Warnings:

  - Added the required column `category` to the `deck` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "deck" ADD COLUMN     "cardCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "mastery" INTEGER NOT NULL DEFAULT 0;
