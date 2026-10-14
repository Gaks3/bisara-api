import z from "zod";

import { compactSignSchema, signSchema } from "./learning.schema";

export const catalogOutput = z
  .object({
    categories: z.array(
      z.object({
        description: z.string().nullable(),
        icon: z.string().nullable().optional(),
        name: z.string(),
        slug: z.string(),
        type: z.string(),
      }),
    ),
    levels: z.array(
      z.object({
        actionText: z.string().nullable(),
        code: z.number(),
        description: z.string().nullable(),
        isLocked: z.boolean(),
        lessons: z.array(
          z.object({
            category: z.object({
              name: z.string(),
              slug: z.string(),
              type: z.string(),
            }),
            completedExercises: z.number(),
            description: z.string().nullable(),
            id: z.string(),
            locked: z.boolean(),
            progressPercent: z.number(),
            slug: z.string(),
            title: z.string(),
            totalExercises: z.number(),
          }),
        ),
        progressPercent: z.number(),
        status: z.enum(["ACTIVE", "UNLOCKED", "LOCKED", "COMPLETED"]),
        title: z.string(),
      }),
    ),
  })
  .meta({
    examples: [
      {
        categories: [
          {
            description: "Huruf Bahasa Isyarat Indonesia",
            icon: "A",
            name: "Abjad A-Z",
            slug: "abjad",
            type: "ALPHABET",
          },
        ],
        levels: [
          {
            actionText: "Lanjut",
            code: 1,
            description: "Materi dasar BISINDO",
            isLocked: false,
            lessons: [
              {
                category: { name: "Abjad", slug: "abjad", type: "ALPHABET" },
                completedExercises: 1,
                description: "Mengenal huruf A sampai Z",
                id: "cm123456789lesson",
                locked: false,
                progressPercent: 50,
                slug: "alphabet-dasar",
                title: "Abjad Dasar",
                totalExercises: 2,
              },
            ],
            progressPercent: 50,
            status: "ACTIVE",
            title: "Level 1: Abjad Ejaan Jari",
          },
        ],
      },
    ],
  });

export const lessonOutput = z
  .object({
    category: z.object({
      name: z.string(),
      slug: z.string(),
      type: z.string(),
    }),
    description: z.string().nullable(),
    exercises: z.array(
      z.object({
        cvConfig: z
          .object({
            confidenceThreshold: z.number(),
            detectionMode: z.string(),
            holdTimeMs: z.number(),
            targetSign: compactSignSchema,
          })
          .nullable(),
        id: z.string(),
        instruction: z.string().nullable(),
        maxScore: z.number(),
        mediaUrl: z.string().nullable().optional(),
        options: z.array(
          z.object({
            id: z.string(),
            label: z.string(),
            sign: compactSignSchema.nullable(),
          }),
        ),
        order: z.number(),
        passingScore: z.number(),
        prompt: z.string(),
        sign: compactSignSchema.nullable().optional(),
        type: z.string(),
      }),
    ),
    id: z.string(),
    level: z.object({ code: z.number(), title: z.string() }),
    materials: z.array(
      z.object({
        content: z.string().nullable(),
        id: z.string(),
        mediaUrl: z.string().nullable(),
        order: z.number(),
        score: z.number(),
        sign: signSchema.nullable(),
        title: z.string(),
        type: z.string(),
      }),
    ),
    slug: z.string(),
    title: z.string(),
  })
  .meta({
    examples: [
      {
        category: { name: "Abjad", slug: "abjad", type: "ALPHABET" },
        description: "Mengenal huruf dasar",
        exercises: [],
        id: "cm123456789lesson",
        level: { code: 1, title: "Level 1: Abjad Ejaan Jari" },
        materials: [],
        slug: "alphabet-dasar",
        title: "Abjad Dasar",
      },
    ],
  });

export const exerciseOutput = z
  .object({
    cvConfig: z
      .object({
        confidenceThreshold: z.number(),
        detectionMode: z.string(),
        holdTimeMs: z.number(),
        targetSign: compactSignSchema,
      })
      .nullable(),
    id: z.string(),
    instruction: z.string().nullable(),
    maxScore: z.number(),
    mediaUrl: z.string().nullable().optional(),
    options: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        sign: compactSignSchema.nullable(),
      }),
    ),
    passingScore: z.number(),
    prompt: z.string(),
    sign: compactSignSchema.nullable().optional(),
    type: z.string(),
  })
  .meta({
    examples: [
      {
        cvConfig: null,
        id: "cm123456789exercise",
        instruction: "Pilih arti gerakan",
        maxScore: 100,
        mediaUrl: null,
        options: [
          {
            id: "cm123456789option",
            label: "Halo",
            sign: { code: "HALO", meaning: "Salam", word: "Halo" },
          },
        ],
        passingScore: 70,
        prompt: "Apa arti gerakan ini?",
        sign: null,
        type: "GUESS_MEANING",
      },
    ],
  });

export const attemptOutput = z
  .object({
    accuracy: z.number().nullable(),
    awardedXp: z.number(),
    feedback: z.string().nullable(),
    id: z.string(),
    newAchievements: z
      .array(
        z.object({
          code: z.string(),
          description: z.string(),
          icon: z.string().nullable(),
          name: z.string(),
        }),
      )
      .optional(),
    progress: z
      .object({
        completedExercises: z.number(),
        lessonId: z.string().nullable(),
        levelId: z.string(),
        progressPercent: z.number(),
        totalExercises: z.number(),
      })
      .optional(),
    score: z.number(),
    status: z.string(),
    streak: z
      .object({
        currentDays: z.number(),
        lastActivityDate: z.string().nullable(),
        longestDays: z.number(),
      })
      .optional(),
    totalScore: z.number(),
  })
  .meta({
    examples: [
      {
        accuracy: 0.98,
        awardedXp: 50,
        feedback: "Posisi telapak tangan tepat & irama lambaian stabil.",
        id: "cm123456789attempt",
        newAchievements: [],
        progress: {
          completedExercises: 2,
          lessonId: "cm123456789lesson",
          levelId: "cm123456789level",
          progressPercent: 50,
          totalExercises: 4,
        },
        score: 50,
        status: "COMPLETED",
        streak: {
          currentDays: 7,
          lastActivityDate: "2026-10-14T00:00:00.000Z",
          longestDays: 12,
        },
        totalScore: 1250,
      },
    ],
  });

export const dashboardOutput = z
  .object({
    activity: z.array(
      z.object({
        date: z.string(),
        minutes: z.number(),
      }),
    ),
    dailyTarget: z.object({
      completedMinutes: z.number(),
      targetMinutes: z.number(),
    }),
    masteredSignsCount: z.number(),
    progress: z.array(
      z.object({
        levelCode: z.number(),
        progressPercent: z.number(),
        score: z.number(),
        title: z.string(),
      }),
    ),
    score: z.number(),
    streak: z.object({
      currentDays: z.number(),
      lastActivityDate: z.string().nullable(),
      longestDays: z.number(),
    }),
    user: z.object({
      bio: z.string().nullable(),
      city: z.string().nullable(),
      email: z.string(),
      id: z.string(),
      image: z.string().nullable(),
      name: z.string(),
      roleTitle: z.string().nullable(),
    }),
  })
  .meta({
    examples: [
      {
        activity: [],
        dailyTarget: {
          completedMinutes: 15,
          targetMinutes: 20,
        },
        masteredSignsCount: 48,
        progress: [
          { levelCode: 1, progressPercent: 50, score: 450, title: "Level 1: Abjad Ejaan Jari" },
        ],
        score: 1250,
        streak: {
          currentDays: 7,
          lastActivityDate: "2026-10-14T00:00:00.000Z",
          longestDays: 12,
        },
        user: {
          bio: "Belajar BISINDO untuk komunikasi tanpa batas.",
          city: "Yogyakarta",
          email: "you@example.com",
          id: "user_123",
          image: null,
          name: "You",
          roleTitle: "Pembelajar Inklusif",
        },
      },
    ],
  });

export const leaderboardOutput = z
  .object({
    entries: z.array(
      z.object({
        rank: z.number(),
        score: z.number(),
        user: z.object({
          id: z.string(),
          image: z.string().nullable(),
          name: z.string(),
        }),
      }),
    ),
    period: z.string(),
  })
  .meta({
    examples: [
      {
        entries: [
          {
            rank: 1,
            score: 2500,
            user: { id: "user_123", image: null, name: "Ade Bagas" },
          },
        ],
        period: "WEEKLY",
      },
    ],
  });

export const streakOutput = z
  .object({
    currentDays: z.number(),
    lastActivityDate: z.string().nullable(),
    longestDays: z.number(),
  })
  .meta({
    examples: [
      {
        currentDays: 7,
        lastActivityDate: "2026-10-14T00:00:00.000Z",
        longestDays: 12,
      },
    ],
  });
