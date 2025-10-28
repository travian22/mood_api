-- CreateTable
CREATE TABLE "mood_entries" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "moodScore" SMALLINT NOT NULL,
    "moodLabel" VARCHAR(100),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mood_entries_userId_idx" ON "mood_entries"("userId");
