import { beforeAll, describe, expect, it } from "vitest";

import { db } from "@/lib/db";

import routing from "@/routing";

import { dictionaryService } from "./dictionary/dictionary.service";
import { learningService } from "./learning/learning.service";
import { profileService } from "./profile/profile.service";

describe("Bisara API Integration & UI Alignment Tests", () => {
  let demoUserId: string;

  beforeAll(async () => {
    const user = await db.user.findFirstOrThrow({
      where: { email: "you@bisara.app" },
    });
    demoUserId = user.id;

    await db.userScore.updateMany({
      data: { totalScore: 1250 },
      where: { userId: user.id },
    });

    const lesson = await db.lesson.findFirst({
      include: { exercises: true },
      where: { slug: "modul-abjad-a-z" },
    });
    const aiExercise = lesson?.exercises.find((e) => e.type === "AI_PRACTICE");
    if (aiExercise) {
      await db.exerciseAttempt.deleteMany({
        where: { exerciseId: aiExercise.id, userId: user.id },
      });
      await db.userAchievement.deleteMany({
        where: {
          achievement: { code: "AI_DETEKSI" },
          userId: user.id,
        },
      });
    }
  });

  describe("1. Learning Catalog & Level Roadmap (Image 2 - Belajar Page)", () => {
    it("should return categories matching UI chips (Abjad A-Z, Kata Hari, Angka)", async () => {
      const catalog = await learningService.getCatalog(demoUserId);
      expect(catalog.categories).toBeDefined();
      expect(catalog.categories.length).toBeGreaterThanOrEqual(3);

      const slugs = catalog.categories.map((c) => c.slug);
      expect(slugs).toContain("abjad");
      expect(slugs).toContain("kata-hari");
      expect(slugs).toContain("angka");
    });

    it("should return levels with progress and status matching PETA LEVEL PEMBELAJARAN", async () => {
      const catalog = await learningService.getCatalog(demoUserId);
      expect(catalog.levels.length).toBeGreaterThanOrEqual(3);

      const level1 = catalog.levels.find((l) => l.code === 1);
      expect(level1).toBeDefined();
      expect(level1?.title).toContain("Level 1");
      expect(level1?.status).toBe("ACTIVE");
      expect(level1?.progressPercent).toBeGreaterThanOrEqual(25);
      expect(level1?.actionText).toBe("Lanjut");
      expect(level1?.isLocked).toBe(false);

      const level3 = catalog.levels.find((l) => l.code === 3);
      expect(level3).toBeDefined();
      expect(level3?.status).toBe("LOCKED");
      expect(level3?.isLocked).toBe(true);
    });
  });

  describe("2. Lesson Detail, Materials & Quiz (Image 2 & 3)", () => {
    it("should return materials for Flashcard and Video peraga", async () => {
      const lesson = await learningService.getLesson("modul-abjad-a-z");
      expect(lesson.title).toBe("Modul Abjad BISINDO A-Z");
      expect(lesson.materials.length).toBeGreaterThanOrEqual(2);

      const flashcard = lesson.materials.find((m) => m.type === "SIGN");
      expect(flashcard).toBeDefined();
      expect(flashcard?.score).toBe(10);
      expect(flashcard?.sign).toBeDefined();
      expect(flashcard?.sign?.word).toBe("Huruf 'A'");
      expect(flashcard?.sign?.description).toContain("Kepalkan tangan");

      const video = lesson.materials.find((m) => m.type === "VIDEO");
      expect(video).toBeDefined();
      expect(video?.mediaUrl).toBeDefined();
      expect(video?.score).toBe(10);
    });

    it("should return Quiz exercise and AI Camera practice exercise", async () => {
      const lesson = await learningService.getLesson("modul-abjad-a-z");
      expect(lesson.exercises.length).toBeGreaterThanOrEqual(2);

      const quiz = lesson.exercises.find((e) => e.type === "GUESS_MEANING");
      expect(quiz).toBeDefined();
      if (!quiz) return;
      expect(quiz.prompt).toMatch(/isyarat berikut ini\?/);
      expect(quiz.options.length).toBe(4);

      const aiExercise = lesson.exercises.find((e) => e.type === "AI_PRACTICE");
      expect(aiExercise).toBeDefined();
      if (!aiExercise) return;
      expect(aiExercise.cvConfig).toBeDefined();
      if (!aiExercise.cvConfig) return;
      expect(aiExercise.cvConfig.confidenceThreshold).toBe(0.85);
      expect(aiExercise.cvConfig.holdTimeMs).toBe(1500);
      expect(["HALO", "Huruf 'A'"]).toContain(aiExercise.cvConfig.targetSign.word);
    });
  });

  describe("3. Profile Page Initial State (Image 4)", () => {
    it("should return complete profile data matching Image 4 specifications", async () => {
      const profile = await profileService.getProfile(demoUserId);

      // User Header
      expect(profile.user.name).toBe("You");
      expect(profile.user.city).toBe("Yogyakarta");
      expect(profile.user.roleTitle).toBe("Pembelajar Inklusif");
      expect(profile.user.bio).toContain("Belajar BISINDO");

      // Level Progress Card
      expect(profile.levelProgress.currentLevel).toBe(4);
      expect(profile.levelProgress.currentLevelTitle).toBe("Pejuang Isyarat");
      expect(profile.levelProgress.nextLevelTitle).toBe("Master BISINDO");

      // Stats
      expect(profile.stats.streakDays).toBe(7);
      expect(profile.stats.totalXp).toBeGreaterThanOrEqual(1250);
      expect(profile.stats.masteredSignsCount).toBeGreaterThanOrEqual(48);
      expect(profile.stats.discussionCount).toBe(12);

      // Achievements (At least 3 / 4 Terbuka)
      expect(profile.achievements.totalCount).toBe(4);
      expect(profile.achievements.unlockedCount).toBeGreaterThanOrEqual(3);

      const unlockedCodes = profile.achievements.list
        .filter((a) => a.isUnlocked)
        .map((a) => a.code);
      expect(unlockedCodes).toContain("MASTER_ABJAD");
      expect(unlockedCodes).toContain("API_KONSISTEN");
      expect(unlockedCodes).toContain("TEMAN_INKLUSIF");

      // Practice History & Preferences
      expect(profile.practiceHistory.length).toBeGreaterThanOrEqual(2);
      expect(profile.preferences.dailyReminder).toBe(true);
      expect(profile.preferences.reminderTime).toBe("19:00 WIB");
    });

    it("should update user preferences and profile details", async () => {
      const updated = await profileService.updateProfile(demoUserId, {
        preferences: {
          dyslexiaFont: true,
          highContrast: false,
        },
      });

      expect(updated.preferences.dyslexiaFont).toBe(true);
    });
  });

  describe("4. Flowchart Execution: Practice Attempt, Score, Streak & Achievement Unlock (Skema 2)", () => {
    it("should award XP, save daily streak, and unlock AI Deteksi achievement on completeAttempt", async () => {
      const lesson = await learningService.getLesson("modul-abjad-a-z");
      const aiExercise = lesson.exercises.find((e) => e.type === "AI_PRACTICE");
      expect(aiExercise).toBeDefined();
      if (!aiExercise) return;

      const result = await learningService.completeAttempt(demoUserId, {
        accuracy: 0.98,
        durationMs: 4200,
        exerciseId: aiExercise.id,
        feedback: "Posisi telapak tangan tepat & irama lambaian stabil.",
        score: 50,
        status: "COMPLETED",
      });

      expect(result.status).toBe("COMPLETED");
      expect(result.awardedXp).toBe(50);
      expect(result.accuracy).toBe(0.98);
      expect(result.streak).toBeDefined();
      if (!result.streak) return;
      expect(result.streak.currentDays).toBeGreaterThanOrEqual(1);
      expect(result.progress).toBeDefined();
      expect(result.totalScore).toBeGreaterThanOrEqual(1250);

      // Skema 2 Test: Repeating the same completed exercise with the same score must award 0 XP
      const repeatResult = await learningService.completeAttempt(demoUserId, {
        accuracy: 0.98,
        durationMs: 3500,
        exerciseId: aiExercise.id,
        feedback: "Latihan ulang selesai",
        score: 50,
        status: "COMPLETED",
      });

      expect(repeatResult.status).toBe("COMPLETED");
      expect(repeatResult.score).toBe(50);
      expect(repeatResult.awardedXp).toBe(0); // 0 additional score
      expect(repeatResult.totalScore).toBe(result.totalScore); // Total score stays the same
    });
  });

  describe("5. Dictionary / Kamus Tab", () => {
    it("should list signs and return single sign detail", async () => {
      const list = await dictionaryService.listSigns({ limit: 10, offset: 0 });
      expect(list.total).toBeGreaterThanOrEqual(6);
      expect(list.signs.length).toBeGreaterThanOrEqual(1);

      const signDetail = await dictionaryService.getSignDetail("HALO");
      expect(signDetail.code).toBe("HALO");
      expect(signDetail.word).toBe("HALO");
      expect(signDetail.description).toBeDefined();
      expect(signDetail.media.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("6. Static Assets Serving", () => {
    it("should have ServeStatic configured for assets in routing", () => {
      expect(routing).toHaveProperty("assets");
    });
  });
});
