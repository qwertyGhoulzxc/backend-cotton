-- DropForeignKey
ALTER TABLE "deck_category" DROP CONSTRAINT "deck_category_userId_fkey";

-- AddForeignKey
ALTER TABLE "deck_category" ADD CONSTRAINT "deck_category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
