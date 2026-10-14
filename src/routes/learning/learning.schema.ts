import z from "zod";

export const signMediaSchema = z.object({
  duration: z.number().nullable(),
  thumbnail: z.string().nullable(),
  type: z.string(),
  url: z.string(),
});

export const signSchema = z.object({
  code: z.string(),
  description: z.string().nullable(),
  difficulty: z.number(),
  meaning: z.string(),
  media: z.array(signMediaSchema),
  word: z.string(),
});

export const compactSignSchema = z.object({
  code: z.string(),
  description: z.string().nullable().optional(),
  meaning: z.string(),
  media: z.array(signMediaSchema).optional(),
  word: z.string(),
});
