-- CreateIndex
CREATE INDEX "FSRS_card_difficulty_id_idx" ON "FSRS_card"("difficulty", "id");

-- CreateIndex
CREATE INDEX "card_created_at_id_idx" ON "card"("created_at", "id");
