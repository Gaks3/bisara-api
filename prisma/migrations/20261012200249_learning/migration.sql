-- CreateEnum
CREATE TYPE "LeaderboardPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "LearningCategoryType" AS ENUM ('ALPHABET', 'NUMBER', 'VOCABULARY');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'SIGN');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('GUESS_MOVEMENT', 'GUESS_MEANING', 'AI_PRACTICE');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "lessonId" TEXT,
    "completedMaterials" INTEGER NOT NULL DEFAULT 0,
    "completedExercises" INTEGER NOT NULL DEFAULT 0,
    "totalExercises" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_score" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_entry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" "LeaderboardPeriod" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3),
    "score" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboard_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_streak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentDays" INTEGER NOT NULL DEFAULT 0,
    "longestDays" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_streak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streak_activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streakId" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "minutes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "streak_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "requirement" JSONB,

    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_level" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_category" (
    "id" TEXT NOT NULL,
    "type" "LearningCategoryType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_material" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "signId" TEXT,
    "type" "MaterialType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "mediaUrl" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sign" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sign_media" (
    "id" TEXT NOT NULL,
    "signId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sign_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "instruction" TEXT,
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_option" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "signId" TEXT,
    "label" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "exercise_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_exercise_config" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "targetSignId" TEXT NOT NULL,
    "confidenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "holdTimeMs" INTEGER NOT NULL DEFAULT 1500,
    "detectionMode" TEXT NOT NULL DEFAULT 'HAND_POSITION',

    CONSTRAINT "cv_exercise_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "detectedSignId" TEXT,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION,
    "durationMs" INTEGER,
    "selectedOption" TEXT,
    "feedback" TEXT,
    "detectionData" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "exercise_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_progress_userId_levelId_idx" ON "user_progress"("userId", "levelId");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_levelId_lessonId_key" ON "user_progress"("userId", "levelId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "user_score_userId_key" ON "user_score"("userId");

-- CreateIndex
CREATE INDEX "leaderboard_entry_period_periodStart_score_idx" ON "leaderboard_entry"("period", "periodStart", "score");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_entry_userId_period_periodStart_key" ON "leaderboard_entry"("userId", "period", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "learning_streak_userId_key" ON "learning_streak"("userId");

-- CreateIndex
CREATE INDEX "streak_activity_streakId_activityDate_idx" ON "streak_activity"("streakId", "activityDate");

-- CreateIndex
CREATE UNIQUE INDEX "streak_activity_userId_activityDate_key" ON "streak_activity"("userId", "activityDate");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_code_key" ON "achievement"("code");

-- CreateIndex
CREATE INDEX "user_achievement_achievementId_idx" ON "user_achievement"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievement_userId_achievementId_key" ON "user_achievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_level_code_key" ON "learning_level"("code");

-- CreateIndex
CREATE INDEX "learning_level_order_idx" ON "learning_level"("order");

-- CreateIndex
CREATE UNIQUE INDEX "learning_category_slug_key" ON "learning_category"("slug");

-- CreateIndex
CREATE INDEX "learning_category_type_order_idx" ON "learning_category"("type", "order");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_slug_key" ON "lesson"("slug");

-- CreateIndex
CREATE INDEX "lesson_levelId_order_idx" ON "lesson"("levelId", "order");

-- CreateIndex
CREATE INDEX "lesson_categoryId_idx" ON "lesson"("categoryId");

-- CreateIndex
CREATE INDEX "learning_material_lessonId_order_idx" ON "learning_material"("lessonId", "order");

-- CreateIndex
CREATE INDEX "learning_material_signId_idx" ON "learning_material"("signId");

-- CreateIndex
CREATE UNIQUE INDEX "sign_code_key" ON "sign"("code");

-- CreateIndex
CREATE INDEX "sign_word_idx" ON "sign"("word");

-- CreateIndex
CREATE INDEX "sign_media_signId_idx" ON "sign_media"("signId");

-- CreateIndex
CREATE INDEX "exercise_levelId_order_idx" ON "exercise"("levelId", "order");

-- CreateIndex
CREATE INDEX "exercise_lessonId_type_idx" ON "exercise"("lessonId", "type");

-- CreateIndex
CREATE INDEX "exercise_option_exerciseId_order_idx" ON "exercise_option"("exerciseId", "order");

-- CreateIndex
CREATE INDEX "exercise_option_signId_idx" ON "exercise_option"("signId");

-- CreateIndex
CREATE UNIQUE INDEX "cv_exercise_config_exerciseId_key" ON "cv_exercise_config"("exerciseId");

-- CreateIndex
CREATE INDEX "cv_exercise_config_targetSignId_idx" ON "cv_exercise_config"("targetSignId");

-- CreateIndex
CREATE INDEX "exercise_attempt_userId_startedAt_idx" ON "exercise_attempt"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "exercise_attempt_exerciseId_idx" ON "exercise_attempt"("exerciseId");

-- CreateIndex
CREATE INDEX "exercise_attempt_detectedSignId_idx" ON "exercise_attempt"("detectedSignId");

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "learning_level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_score" ADD CONSTRAINT "user_score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_entry" ADD CONSTRAINT "leaderboard_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_streak" ADD CONSTRAINT "learning_streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streak_activity" ADD CONSTRAINT "streak_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streak_activity" ADD CONSTRAINT "streak_activity_streakId_fkey" FOREIGN KEY ("streakId") REFERENCES "learning_streak"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "learning_level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "learning_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_material" ADD CONSTRAINT "learning_material_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_material" ADD CONSTRAINT "learning_material_signId_fkey" FOREIGN KEY ("signId") REFERENCES "sign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sign_media" ADD CONSTRAINT "sign_media_signId_fkey" FOREIGN KEY ("signId") REFERENCES "sign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise" ADD CONSTRAINT "exercise_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "learning_level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise" ADD CONSTRAINT "exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_option" ADD CONSTRAINT "exercise_option_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_option" ADD CONSTRAINT "exercise_option_signId_fkey" FOREIGN KEY ("signId") REFERENCES "sign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_exercise_config" ADD CONSTRAINT "cv_exercise_config_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_exercise_config" ADD CONSTRAINT "cv_exercise_config_targetSignId_fkey" FOREIGN KEY ("targetSignId") REFERENCES "sign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_attempt" ADD CONSTRAINT "exercise_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_attempt" ADD CONSTRAINT "exercise_attempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_attempt" ADD CONSTRAINT "exercise_attempt_detectedSignId_fkey" FOREIGN KEY ("detectedSignId") REFERENCES "sign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
