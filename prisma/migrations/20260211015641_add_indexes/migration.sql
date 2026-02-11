-- CreateIndex
CREATE INDEX "FSRS_card_card_id_idx" ON "FSRS_card"("card_id");

-- CreateIndex
CREATE INDEX "FSRS_card_due_idx" ON "FSRS_card"("due");

-- CreateIndex
CREATE INDEX "FSRS_card_difficulty_stability_due_idx" ON "FSRS_card"("difficulty", "stability", "due");

-- CreateIndex
CREATE INDEX "FSRS_card_log_fsrs_card_id_idx" ON "FSRS_card_log"("fsrs_card_id");

-- CreateIndex
CREATE INDEX "FSRS_card_log_review_idx" ON "FSRS_card_log"("review");

-- CreateIndex
CREATE INDEX "FSRS_card_log_fsrs_card_id_review_idx" ON "FSRS_card_log"("fsrs_card_id", "review");

-- CreateIndex
CREATE INDEX "card_deck_id_idx" ON "card"("deck_id");

-- CreateIndex
CREATE INDEX "deck_deck_category_id_idx" ON "deck"("deck_category_id");
