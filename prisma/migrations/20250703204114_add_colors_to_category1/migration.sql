/*
  Warnings:

  - You are about to drop the column `category_color` on the `deck_category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "deck_category" DROP COLUMN "category_color",
ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'blue';
