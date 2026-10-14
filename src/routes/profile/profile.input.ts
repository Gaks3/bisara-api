import z from "zod";

export const emptyInput = z.object({});

export const updateProfileInput = z
  .object({
    bio: z.string().max(300).optional(),
    city: z.string().max(100).optional(),
    image: z.url().optional(),
    name: z.string().min(1).max(100).optional(),
    preferences: z
      .object({
        dailyReminder: z.boolean().optional(),
        dyslexiaFont: z.boolean().optional(),
        highContrast: z.boolean().optional(),
        reminderTime: z.string().optional(),
      })
      .optional(),
  })
  .meta({
    examples: [
      {
        bio: "Belajar BISINDO untuk komunikasi tanpa batas.",
        city: "Yogyakarta",
        name: "You",
        preferences: {
          dailyReminder: true,
          dyslexiaFont: false,
          highContrast: false,
          reminderTime: "19:00 WIB",
        },
      },
    ],
  });
