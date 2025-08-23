-- CreateIndex
CREATE INDEX "deck_updated_at_id_idx" ON "deck"("updated_at", "id");

-- CreateIndex
CREATE INDEX "deck_created_at_id_idx" ON "deck"("created_at", "id");

-- CreateIndex
CREATE INDEX "deck_card_count_id_idx" ON "deck"("card_count", "id");

-- CreateIndex
CREATE INDEX "deck_name_id_idx" ON "deck"("name", "id");

-- CreateIndex
CREATE INDEX "deck_session_mastery_deckId_idx" ON "deck_session"("mastery", "deckId");

-- CreateIndex
CREATE INDEX "deck_session_updated_at_deckId_idx" ON "deck_session"("updated_at", "deckId");
