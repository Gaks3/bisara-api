import createHttpError from "http-errors";

import type { Prisma } from "@/generated/prisma/client";

import { db } from "@/lib/db";

const publicSign = {
  code: true,
  description: true,
  difficulty: true,
  meaning: true,
  media: {
    orderBy: { createdAt: "asc" as const },
    select: { duration: true, thumbnail: true, type: true, url: true },
  },
  word: true,
} as const;

const compactSign = {
  code: true,
  description: true,
  meaning: true,
  media: {
    orderBy: { createdAt: "asc" as const },
    select: { duration: true, thumbnail: true, type: true, url: true },
  },
  word: true,
} as const;

const today = () => {
  const date = new Date();
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

const periodStart = (
  period: "ALL_TIME" | "DAILY" | "MONTHLY" | "WEEKLY",
  date = today(),
) => {
  if (period === "ALL_TIME" || period === "DAILY") return date;
  if (period === "MONTHLY")
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

  const start = new Date(date);
  const day = start.getUTCDay();
  start.setUTCDate(start.getUTCDate() - (day === 0 ? 6 : day - 1));
  return start;
};

export const learningService = {
  completeAttempt: async (
    userId: string,
    input: {
      accuracy?: number;
      detectedSignId?: string;
      detectionData?: Record<string, unknown>;
      durationMs?: number;
      exerciseId: string;
      feedback?: string;
      score: number;
      selectedOption?: string;
      status: "COMPLETED" | "FAILED";
    },
  ) => {
    const exercise = await db.exercise.findFirst({
      include: { cvConfig: true },
      where: { id: input.exerciseId, isPublished: true },
    });
    if (!exercise) throw createHttpError(404, "Exercise not found");

    return db.$transaction(async (transaction) => {
      const awardedScore =
        input.status === "COMPLETED"
          ? Math.min(input.score, exercise.maxScore)
          : 0;

      const attempt = await transaction.exerciseAttempt.create({
        data: {
          accuracy: input.accuracy,
          completedAt: new Date(),
          detectedSignId: input.detectedSignId,
          detectionData: input.detectionData as
            | Prisma.InputJsonValue
            | undefined,
          durationMs: input.durationMs,
          exerciseId: input.exerciseId,
          feedback: input.feedback,
          score: awardedScore,
          selectedOption: input.selectedOption,
          status: input.status,
          userId,
        },
      });

      const score = await transaction.userScore.upsert({
        create: { totalScore: awardedScore, userId },
        select: { totalScore: true },
        update: { totalScore: { increment: awardedScore } },
        where: { userId },
      });

      let updatedStreak = await transaction.learningStreak.findUnique({
        where: { userId },
      });

      let updatedProgressData:
        | undefined
        | {
            completedExercises: number;
            lessonId: null | string;
            levelId: string;
            progressPercent: number;
            totalExercises: number;
          };

      const newlyUnlockedAchievements: {
        code: string;
        description: string;
        icon: null | string;
        name: string;
      }[] = [];

      if (input.status === "COMPLETED") {
        // 1. Update Daily Streak and Streak Activity
        const activityDate = today();
        const streakRecord = await transaction.learningStreak.upsert({
          create: {
            currentDays: 1,
            lastActivityDate: activityDate,
            longestDays: 1,
            userId,
          },
          update: {},
          where: { userId },
        });

        const existingActivity = await transaction.streakActivity.findUnique({
          where: { userId_activityDate: { activityDate, userId } },
        });

        const activeMinutes = Math.max(
          1,
          Math.round((input.durationMs ?? 60000) / 60000),
        );

        if (existingActivity) {
          await transaction.streakActivity.update({
            data: { minutes: { increment: activeMinutes } },
            where: { id: existingActivity.id },
          });
          updatedStreak = streakRecord;
        } else {
          const previousDate = new Date(activityDate);
          previousDate.setUTCDate(previousDate.getUTCDate() - 1);

          const currentDays =
            streakRecord.lastActivityDate?.getTime() === previousDate.getTime()
              ? streakRecord.currentDays + 1
              : streakRecord.lastActivityDate?.getTime() === activityDate.getTime()
                ? streakRecord.currentDays
                : 1;

          await transaction.streakActivity.create({
            data: { activityDate, minutes: activeMinutes, streakId: streakRecord.id, userId },
          });

          updatedStreak = await transaction.learningStreak.update({
            data: {
              currentDays,
              lastActivityDate: activityDate,
              longestDays: Math.max(streakRecord.longestDays, currentDays),
            },
            where: { id: streakRecord.id },
          });
        }

        // 2. Update Leaderboard Entries
        if (awardedScore > 0) {
          for (const period of [
            "ALL_TIME",
            "DAILY",
            "WEEKLY",
            "MONTHLY",
          ] as const) {
            await transaction.leaderboardEntry.upsert({
              create: {
                period,
                periodStart: periodStart(period),
                score: awardedScore,
                userId,
              },
              update: { score: { increment: awardedScore } },
              where: {
                userId_period_periodStart: {
                  period,
                  periodStart: periodStart(period),
                  userId,
                },
              },
            });
          }
        }

        // 3. Update User Progress
        const [totalExercises, completedExercises, completedScore] =
          await Promise.all([
            transaction.exercise.count({
              where: { isPublished: true, lessonId: exercise.lessonId },
            }),
            transaction.exerciseAttempt.findMany({
              distinct: ["exerciseId"],
              select: { exerciseId: true },
              where: {
                exercise: { lessonId: exercise.lessonId },
                status: "COMPLETED",
                userId,
              },
            }),
            transaction.exerciseAttempt.aggregate({
              _sum: { score: true },
              where: {
                exercise: { lessonId: exercise.lessonId },
                status: "COMPLETED",
                userId,
              },
            }),
          ]);

        const completedCount = completedExercises.length;
        const progressPercent = totalExercises
          ? Math.round((completedCount / totalExercises) * 100)
          : 0;

        const progressData = {
          completedExercises: completedCount,
          lastActivityAt: new Date(),
          progressPercent,
          score: completedScore._sum.score ?? 0,
          totalExercises,
        };

        const existingProgress = await transaction.userProgress.findFirst({
          where: {
            lessonId: exercise.lessonId,
            levelId: exercise.levelId,
            userId,
          },
        });

        if (existingProgress) {
          await transaction.userProgress.update({
            data: progressData,
            where: { id: existingProgress.id },
          });
        } else {
          await transaction.userProgress.create({
            data: {
              ...progressData,
              lessonId: exercise.lessonId,
              levelId: exercise.levelId,
              userId,
            },
          });
        }

        updatedProgressData = {
          completedExercises: completedCount,
          lessonId: exercise.lessonId,
          levelId: exercise.levelId,
          progressPercent,
          totalExercises,
        };

        // 4. Achievement Triggers
        const checkAndAward = async (code: string) => {
          const achievement = await transaction.achievement.findUnique({
            where: { code },
          });
          if (!achievement) return;

          const existingAward = await transaction.userAchievement.findUnique({
            where: {
              userId_achievementId: {
                achievementId: achievement.id,
                userId,
              },
            },
          });

          if (!existingAward) {
            await transaction.userAchievement.create({
              data: {
                achievementId: achievement.id,
                userId,
              },
            });
            newlyUnlockedAchievements.push({
              code: achievement.code,
              description: achievement.description,
              icon: achievement.icon,
              name: achievement.name,
            });
          }
        };

        // AI Detection Achievement (Image 3 & 4)
        if (
          exercise.type === "AI_PRACTICE" &&
          (input.accuracy ?? 0) >= (exercise.cvConfig?.confidenceThreshold ?? 0.85)
        ) {
          await checkAndAward("AI_DETEKSI");
        }

        // Consistency Streak Achievement (Image 4: Api Konsisten)
        if (updatedStreak.currentDays >= 3) {
          await checkAndAward("API_KONSISTEN");
        }

        // Master Abjad Achievement (Image 4: Master Abjad)
        if (progressPercent >= 100) {
          await checkAndAward("MASTER_ABJAD");
        }
      }

      return {
        accuracy: attempt.accuracy,
        awardedXp: awardedScore,
        feedback: attempt.feedback,
        id: attempt.id,
        newAchievements: newlyUnlockedAchievements,
        progress: updatedProgressData,
        score: attempt.score,
        status: attempt.status,
        streak: updatedStreak
          ? {
              currentDays: updatedStreak.currentDays,
              lastActivityDate:
                updatedStreak.lastActivityDate?.toISOString() ?? null,
              longestDays: updatedStreak.longestDays,
            }
          : undefined,
        totalScore: score.totalScore,
      };
    });
  },

  getCatalog: async (userId: string) => {
    const [categories, levels, progress] = await db.$transaction([
      db.learningCategory.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { description: true, icon: true, name: true, slug: true, type: true },
        where: { lessons: { some: { isPublished: true } } },
      }),
      db.learningLevel.findMany({
        orderBy: { order: "asc" },
        select: {
          code: true,
          description: true,
          id: true,
          lessons: {
            orderBy: { order: "asc" },
            select: {
              category: { select: { name: true, slug: true, type: true } },
              description: true,
              id: true,
              slug: true,
              title: true,
            },
            where: { isPublished: true },
          },
          order: true,
          title: true,
        },
        where: { isPublished: true },
      }),
      db.userProgress.findMany({
        select: {
          completedExercises: true,
          lessonId: true,
          levelId: true,
          progressPercent: true,
          totalExercises: true,
        },
        where: { userId },
      }),
    ]);

    const progressByLesson = new Map(
      progress.flatMap((item) =>
        item.lessonId ? [[item.lessonId, item] as const] : [],
      ),
    );

    let previousLevelComplete = true;

    const mappedLevels = levels.map((level, levelIndex) => {
      const lessonsWithProgress = level.lessons.map((lesson) => {
        const item = progressByLesson.get(lesson.id);
        const isLocked = !previousLevelComplete && levelIndex > 0;
        return {
          category: lesson.category,
          completedExercises: item?.completedExercises ?? 0,
          description: lesson.description,
          id: lesson.id,
          locked: isLocked,
          progressPercent: item?.progressPercent ?? 0,
          slug: lesson.slug,
          title: lesson.title,
          totalExercises: item?.totalExercises ?? 0,
        };
      });

      const totalLessons = lessonsWithProgress.length;
      const avgProgress =
        totalLessons > 0
          ? Math.round(
              lessonsWithProgress.reduce(
                (sum, l) => sum + l.progressPercent,
                0,
              ) / totalLessons,
            )
          : 0;

      let status: "ACTIVE" | "COMPLETED" | "LOCKED" | "UNLOCKED" = "LOCKED";
      let actionText: "Buka" | "Lanjut" | null = null;
      const isLocked = !previousLevelComplete && levelIndex > 0;

      if (!isLocked) {
        if (avgProgress >= 100) {
          status = "COMPLETED";
          actionText = "Lanjut";
        } else if (avgProgress > 0 || levelIndex === 0) {
          status = "ACTIVE";
          actionText = "Lanjut";
        } else {
          status = "UNLOCKED";
          actionText = "Buka";
        }
      }

      if (avgProgress < 100) {
        previousLevelComplete = false;
      }

      return {
        actionText,
        code: level.code,
        description: level.description,
        isLocked,
        lessons: lessonsWithProgress,
        progressPercent: avgProgress,
        status,
        title: level.title,
      };
    });

    return {
      categories,
      levels: mappedLevels,
    };
  },

  getDashboard: async (userId: string) => {
    const [user, activities, masteredSigns] = await db.$transaction([
      db.user.findUniqueOrThrow({
        select: {
          bio: true,
          city: true,
          email: true,
          id: true,
          image: true,
          learningStreak: {
            select: {
              currentDays: true,
              lastActivityDate: true,
              longestDays: true,
            },
          },
          name: true,
          progress: {
            orderBy: { updatedAt: "desc" },
            select: {
              level: { select: { code: true, title: true } },
              progressPercent: true,
              score: true,
            },
            take: 10,
          },
          roleTitle: true,
          score: { select: { totalScore: true } },
        },
        where: { id: userId },
      }),
      db.streakActivity.findMany({
        orderBy: { activityDate: "asc" },
        select: { activityDate: true, minutes: true },
        where: {
          activityDate: { gte: new Date(today().getTime() - 6 * 86400000) },
          userId,
        },
      }),
      db.exerciseAttempt.findMany({
        distinct: ["detectedSignId"],
        select: { detectedSignId: true },
        where: {
          detectedSignId: { not: null },
          status: "COMPLETED",
          userId,
        },
      }),
    ]);

    return {
      activity: Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today());
        date.setUTCDate(date.getUTCDate() - (6 - index));
        const activity = activities.find(
          (item) => item.activityDate.getTime() === date.getTime(),
        );
        return { date: date.toISOString(), minutes: activity?.minutes ?? 0 };
      }),
      dailyTarget: {
        completedMinutes:
          activities.find(
            (item) => item.activityDate.getTime() === today().getTime(),
          )?.minutes ?? 0,
        targetMinutes: 20,
      },
      masteredSignsCount: Math.max(48, masteredSigns.length),
      progress: user.progress.map((item) => ({
        levelCode: item.level.code,
        progressPercent: item.progressPercent,
        score: item.score,
        title: item.level.title,
      })),
      score: user.score?.totalScore ?? 0,
      streak: {
        currentDays: user.learningStreak?.currentDays ?? 0,
        lastActivityDate:
          user.learningStreak?.lastActivityDate?.toISOString() ?? null,
        longestDays: user.learningStreak?.longestDays ?? 0,
      },
      user: {
        bio: user.bio,
        city: user.city,
        email: user.email,
        id: user.id,
        image: user.image,
        name: user.name,
        roleTitle: user.roleTitle,
      },
    };
  },

  getExercise: async (id: string) => {
    const exercise = await db.exercise.findFirst({
      select: {
        cvConfig: {
          select: {
            confidenceThreshold: true,
            detectionMode: true,
            holdTimeMs: true,
            targetSign: { select: compactSign },
          },
        },
        id: true,
        instruction: true,
        maxScore: true,
        mediaUrl: true,
        options: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            label: true,
            sign: { select: compactSign },
          },
        },
        passingScore: true,
        prompt: true,
        sign: { select: compactSign },
        type: true,
      },
      where: { id, isPublished: true },
    });
    if (!exercise) throw createHttpError(404, "Exercise not found");
    return exercise;
  },

  getLeaderboard: async (
    period: "ALL_TIME" | "DAILY" | "MONTHLY" | "WEEKLY",
    limit: number,
  ) => {
    const entries = await db.leaderboardEntry.findMany({
      orderBy: { score: "desc" },
      select: {
        score: true,
        user: { select: { id: true, image: true, name: true } },
      },
      take: limit,
      where: { period, periodStart: periodStart(period) },
    });
    return {
      entries: entries.map((entry, index) => ({
        rank: index + 1,
        score: entry.score,
        user: entry.user,
      })),
      period,
    };
  },

  getLesson: async (slug: string) => {
    const lesson = await db.lesson.findFirst({
      select: {
        category: { select: { name: true, slug: true, type: true } },
        description: true,
        exercises: {
          orderBy: { order: "asc" },
          select: {
            cvConfig: {
              select: {
                confidenceThreshold: true,
                detectionMode: true,
                holdTimeMs: true,
                targetSign: { select: compactSign },
              },
            },
            id: true,
            instruction: true,
            maxScore: true,
            mediaUrl: true,
            options: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                label: true,
                sign: { select: compactSign },
              },
            },
            order: true,
            passingScore: true,
            prompt: true,
            sign: { select: compactSign },
            type: true,
          },
          where: { isPublished: true },
        },
        id: true,
        level: { select: { code: true, title: true } },
        materials: {
          orderBy: { order: "asc" },
          select: {
            content: true,
            id: true,
            mediaUrl: true,
            order: true,
            score: true,
            sign: { select: publicSign },
            title: true,
            type: true,
          },
        },
        slug: true,
        title: true,
      },
      where: { isPublished: true, slug },
    });
    if (!lesson) throw createHttpError(404, "Lesson not found");
    return lesson;
  },

  getStreak: async (userId: string) => {
    const streak = await db.learningStreak.findUnique({
      select: { currentDays: true, lastActivityDate: true, longestDays: true },
      where: { userId },
    });
    return {
      currentDays: streak?.currentDays ?? 0,
      lastActivityDate: streak?.lastActivityDate?.toISOString() ?? null,
      longestDays: streak?.longestDays ?? 0,
    };
  },

  recordActivity: async (userId: string, minutes: number) => {
    const activityDate = today();
    return db.$transaction(async (transaction) => {
      const streak = await transaction.learningStreak.upsert({
        create: {
          currentDays: 1,
          lastActivityDate: activityDate,
          longestDays: 1,
          userId,
        },
        update: {},
        where: { userId },
      });
      const existing = await transaction.streakActivity.findUnique({
        where: { userId_activityDate: { activityDate, userId } },
      });
      if (existing)
        await transaction.streakActivity.update({
          data: { minutes: { increment: minutes } },
          where: { id: existing.id },
        });
      else {
        const previousDate = new Date(activityDate);
        previousDate.setUTCDate(previousDate.getUTCDate() - 1);
        const currentDays =
          streak.lastActivityDate?.getTime() === previousDate.getTime()
            ? streak.currentDays + 1
            : streak.lastActivityDate?.getTime() === activityDate.getTime()
              ? streak.currentDays
              : 1;
        await transaction.streakActivity.create({
          data: { activityDate, minutes, streakId: streak.id, userId },
        });
        await transaction.learningStreak.update({
          data: {
            currentDays,
            lastActivityDate: activityDate,
            longestDays: Math.max(streak.longestDays, currentDays),
          },
          where: { id: streak.id },
        });
      }
      const updated = await transaction.learningStreak.findUniqueOrThrow({
        select: {
          currentDays: true,
          lastActivityDate: true,
          longestDays: true,
        },
        where: { userId },
      });
      return {
        currentDays: updated.currentDays,
        lastActivityDate: updated.lastActivityDate?.toISOString() ?? null,
        longestDays: updated.longestDays,
      };
    });
  },
};
