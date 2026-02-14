-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GOOGLE');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "provider" "Provider",
    "is_activated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL,
    "avatar_path" TEXT NOT NULL DEFAULT 'avatar/defaultAvatar.jpg',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL DEFAULT '',
    "last_name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activation_code" (
    "code" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "reset_password_code" (
    "code" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "token" (
    "token" TEXT NOT NULL,
    "exp" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "deck" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "card_count" INTEGER NOT NULL DEFAULT 0,
    "deck_category_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'bookOpen',
    "color" TEXT NOT NULL DEFAULT 'blue',

    CONSTRAINT "deck_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FSRS_weights" (
    "id" TEXT NOT NULL,
    "w" JSONB NOT NULL DEFAULT '[0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729]',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "FSRS_weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_session" (
    "id" TEXT NOT NULL,
    "mastery" INTEGER NOT NULL DEFAULT 0,
    "totalTime" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deck_id" TEXT NOT NULL,
    "is_short_term" BOOLEAN NOT NULL DEFAULT false,
    "cards_per_session" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "deck_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deck_id" TEXT NOT NULL,
    "plainAnswer" TEXT NOT NULL,
    "plainQuestion" TEXT NOT NULL,

    CONSTRAINT "card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FSRS_card" (
    "id" TEXT NOT NULL,
    "due" TIMESTAMP(3) NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "elapsed_days" INTEGER NOT NULL,
    "scheduled_days" INTEGER NOT NULL,
    "learning_steps" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "lapses" INTEGER NOT NULL,
    "state" INTEGER NOT NULL,
    "last_review" TIMESTAMP(3),
    "card_id" TEXT NOT NULL,

    CONSTRAINT "FSRS_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FSRS_card_log" (
    "id" TEXT NOT NULL,
    "review" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER NOT NULL,
    "state" INTEGER NOT NULL,
    "due" TIMESTAMP(3) NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "elapsed_days" INTEGER NOT NULL,
    "last_elapsed_days" INTEGER NOT NULL,
    "scheduled_days" INTEGER NOT NULL,
    "learning_steps" INTEGER NOT NULL,
    "fsrs_card_id" TEXT NOT NULL,

    CONSTRAINT "FSRS_card_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "profile_user_id_key" ON "profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "activation_code_user_id_key" ON "activation_code"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "reset_password_code_user_id_key" ON "reset_password_code"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "token_token_key" ON "token"("token");

-- CreateIndex
CREATE INDEX "deck_updated_at_id_idx" ON "deck"("updated_at", "id");

-- CreateIndex
CREATE INDEX "deck_created_at_id_idx" ON "deck"("created_at", "id");

-- CreateIndex
CREATE INDEX "deck_card_count_id_idx" ON "deck"("card_count", "id");

-- CreateIndex
CREATE INDEX "deck_name_id_idx" ON "deck"("name", "id");

-- CreateIndex
CREATE INDEX "deck_deck_category_id_idx" ON "deck"("deck_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "deck_category_user_id_name_key" ON "deck_category"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "FSRS_weights_category_id_key" ON "FSRS_weights"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "deck_session_deck_id_key" ON "deck_session"("deck_id");

-- CreateIndex
CREATE INDEX "deck_session_mastery_deck_id_idx" ON "deck_session"("mastery", "deck_id");

-- CreateIndex
CREATE INDEX "deck_session_updated_at_deck_id_idx" ON "deck_session"("updated_at", "deck_id");

-- CreateIndex
CREATE INDEX "card_created_at_id_idx" ON "card"("created_at", "id");

-- CreateIndex
CREATE INDEX "card_deck_id_idx" ON "card"("deck_id");

-- CreateIndex
CREATE UNIQUE INDEX "FSRS_card_card_id_key" ON "FSRS_card"("card_id");

-- CreateIndex
CREATE INDEX "FSRS_card_difficulty_id_idx" ON "FSRS_card"("difficulty", "id");

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

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activation_code" ADD CONSTRAINT "activation_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_password_code" ADD CONSTRAINT "reset_password_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck" ADD CONSTRAINT "deck_deck_category_id_fkey" FOREIGN KEY ("deck_category_id") REFERENCES "deck_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck" ADD CONSTRAINT "deck_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_category" ADD CONSTRAINT "deck_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FSRS_weights" ADD CONSTRAINT "FSRS_weights_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "deck_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_session" ADD CONSTRAINT "deck_session_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "card_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FSRS_card" ADD CONSTRAINT "FSRS_card_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FSRS_card_log" ADD CONSTRAINT "FSRS_card_log_fsrs_card_id_fkey" FOREIGN KEY ("fsrs_card_id") REFERENCES "FSRS_card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

