/*
  Warnings:

  - Added the required column `plainAnswer` to the `card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plainQuestion` to the `card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "card" ADD COLUMN     "plainAnswer" TEXT NOT NULL,
ADD COLUMN     "plainQuestion" TEXT NOT NULL;
