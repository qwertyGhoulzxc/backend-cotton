/*
  Warnings:

  - The `totalTime` column on the `deck_session` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "deck_session" DROP COLUMN "totalTime",
ADD COLUMN     "totalTime" INTEGER NOT NULL DEFAULT 0;
