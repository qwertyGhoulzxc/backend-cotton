/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `deck_category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `deck_category` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "deck_category_name_key";

-- AlterTable
ALTER TABLE "deck_category" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "deck_category_userId_name_key" ON "deck_category"("userId", "name");

-- AddForeignKey
ALTER TABLE "deck_category" ADD CONSTRAINT "deck_category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
