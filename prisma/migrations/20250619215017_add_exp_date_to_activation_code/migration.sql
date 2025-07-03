/*
  Warnings:

  - You are about to drop the column `createdAt` on the `activation_code` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "activation_code" DROP COLUMN "createdAt",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
