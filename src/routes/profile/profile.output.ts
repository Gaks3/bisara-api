import z from "zod";

export const profileOutput = z
  .object({
    achievements: z.object({
      list: z.array(
        z.object({
          code: z.string(),
          description: z.string(),
          icon: z.string().nullable(),
          iconUrl: z.string().nullable(),
          id: z.string(),
          isUnlocked: z.boolean(),
          name: z.string(),
          unlockedAt: z.string().nullable(),
        }),
      ),
      totalCount: z.number(),
      unlockedCount: z.number(),
    }),
    levelProgress: z.object({
      currentLevel: z.number(),
      currentLevelTitle: z.string(),
      currentLevelXp: z.number(),
      nextLevelTitle: z.string(),
      nextLevelXp: z.number(),
      progressPercent: z.number(),
      remainingXp: z.number(),
    }),
    practiceHistory: z.array(
      z.object({
        badge: z.string(),
        date: z.string(),
        id: z.string(),
        itemCountText: z.string(),
        timeAgo: z.string(),
        title: z.string(),
        xpGained: z.number(),
      }),
    ),
    preferences: z.object({
      dailyReminder: z.boolean(),
      dyslexiaFont: z.boolean(),
      highContrast: z.boolean(),
      reminderTime: z.string(),
    }),
    savedItemsCount: z.number(),
    stats: z.object({
      discussionCount: z.number(),
      masteredSignsCount: z.number(),
      streakDays: z.number(),
      totalXp: z.number(),
    }),
    user: z.object({
      bio: z.string().nullable(),
      city: z.string().nullable(),
      email: z.string(),
      id: z.string(),
      image: z.string().nullable(),
      isVerified: z.boolean(),
      name: z.string(),
      roleTitle: z.string().nullable(),
    }),
  })
  .meta({
    examples: [
      {
        achievements: {
          list: [
            {
              code: "MASTER_ABJAD",
              description: "Selesaikan semua huruf isyarat dasar BISINDO A-Z",
              icon: "check",
              iconUrl: null,
              id: "ach_1",
              isUnlocked: true,
              name: "Master Abjad",
              unlockedAt: "2026-10-12T00:00:00.000Z",
            },
          ],
          totalCount: 4,
          unlockedCount: 3,
        },
        levelProgress: {
          currentLevel: 4,
          currentLevelTitle: "Pejuang Isyarat",
          currentLevelXp: 750,
          nextLevelTitle: "Master BISINDO",
          nextLevelXp: 1000,
          progressPercent: 75,
          remainingXp: 250,
        },
        practiceHistory: [
          {
            badge: "AZ",
            date: "2026-10-13T10:00:00.000Z",
            id: "hist_1",
            itemCountText: "15 Kosakata",
            timeAgo: "Kemarin",
            title: "Modul Abjad BISINDO A-Z",
            xpGained: 50,
          },
        ],
        preferences: {
          dailyReminder: true,
          dyslexiaFont: false,
          highContrast: false,
          reminderTime: "19:00 WIB",
        },
        savedItemsCount: 3,
        stats: {
          discussionCount: 12,
          masteredSignsCount: 48,
          streakDays: 7,
          totalXp: 1250,
        },
        user: {
          bio: "Belajar BISINDO untuk komunikasi tanpa batas.",
          city: "Yogyakarta",
          email: "you@example.com",
          id: "user_123",
          image: null,
          isVerified: true,
          name: "You",
          roleTitle: "Pembelajar Inklusif",
        },
      },
    ],
  });
