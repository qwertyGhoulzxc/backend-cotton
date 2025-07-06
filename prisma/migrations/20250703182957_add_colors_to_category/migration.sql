/*
  Warnings:

  - You are about to drop the column `createdAt` on the `card` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `card` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `deck` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `deck` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `deck_category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `deck_category` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `deck_category` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `deck_session` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `deck_session` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,name]` on the table `deck_category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `deck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `deck_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `deck_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `deck_session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "deck_category" DROP CONSTRAINT "deck_category_userId_fkey";

-- DropIndex
DROP INDEX "deck_category_userId_name_key";

-- AlterTable
ALTER TABLE "card" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "deck" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "deck_category" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "category_color" TEXT NOT NULL DEFAULT 'blue',
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "deck_session" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "deck_category_user_id_name_key" ON "deck_category"("user_id", "name");

-- AddForeignKey
ALTER TABLE "deck_category" ADD CONSTRAINT "deck_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
