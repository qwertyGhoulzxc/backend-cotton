-- AlterTable
ALTER TABLE "user" ADD COLUMN     "is_activated" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "activation_code" (
    "code" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "reset_password_code" (
    "code" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "activation_code_user_id_key" ON "activation_code"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "reset_password_code_user_id_key" ON "reset_password_code"("user_id");

-- AddForeignKey
ALTER TABLE "activation_code" ADD CONSTRAINT "activation_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_password_code" ADD CONSTRAINT "reset_password_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
