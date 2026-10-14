import z from "zod";

export const emptyInput = z.object({});

export const lessonInput = z
  .object({ slug: z.string().min(1) })
  .meta({ examples: [{ slug: "alphabet-dasar" }] });

export const exerciseInput = z
  .object({ id: z.string().min(1) })
  .meta({ examples: [{ id: "cm123456789exercise" }] });

export const attemptInput = z
  .object({
    accuracy: z.number().min(0).max(1).optional(),
    detectedSignId: z.string().optional(),
    detectionData: z.record(z.string(), z.unknown()).optional(),
    durationMs: z.number().int().positive().optional(),
    exerciseId: z.string().min(1),
    feedback: z.string().max(500).optional(),
    score: z.number().int().min(0).max(100),
    selectedOption: z.string().optional(),
    status: z.enum(["COMPLETED", "FAILED"]),
  })
  .meta({
    examples: [
      {
        accuracy: 0.96,
        durationMs: 4200,
        exerciseId: "cm123456789exercise",
        feedback: "Gerakan terdeteksi dengan baik",
        score: 95,
        selectedOption: "cm123456789option",
        status: "COMPLETED",
      },
    ],
  });

export const leaderboardInput = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(10),
    period: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "ALL_TIME"])
      .default("ALL_TIME"),
  })
  .meta({ examples: [{ limit: 10, period: "WEEKLY" }] });

export const streakActivityInput = z
  .object({ minutes: z.number().int().min(1).max(1440) })
  .meta({ examples: [{ minutes: 20 }] });
