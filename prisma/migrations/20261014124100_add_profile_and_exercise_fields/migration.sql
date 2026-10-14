-- AlterTable
ALTER TABLE "achievement" ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "exercise" ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "signId" TEXT;

-- AlterTable
ALTER TABLE "learning_category" ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "displayUsername" TEXT,
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "roleTitle" TEXT DEFAULT 'Pembelajar Inklusif',
ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE INDEX "exercise_signId_idx" ON "exercise"("signId");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- AddForeignKey
ALTER TABLE "exercise" ADD CONSTRAINT "exercise_signId_fkey" FOREIGN KEY ("signId") REFERENCES "sign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
