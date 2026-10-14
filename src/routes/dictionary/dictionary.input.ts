import z from "zod";

export const listSignsInput = z
  .object({
    category: z.enum(["ALPHABET", "NUMBER", "VOCABULARY"]).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
    search: z.string().optional(),
  })
  .meta({
    examples: [{ category: "ALPHABET", limit: 20, offset: 0, search: "Halo" }],
  });

export const signDetailInput = z
  .object({
    code: z.string().min(1),
  })
  .meta({
    examples: [{ code: "HALO" }],
  });
