/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `activation_code` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "activation_code" DROP COLUMN "expiresAt",
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "card" ALTER COLUMN "priority" SET DEFAULT 1,
ALTER COLUMN "ef" SET DEFAULT 2.5;
