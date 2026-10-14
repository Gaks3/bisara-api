import z from "zod";

import { signSchema } from "../learning/learning.schema";

export const dictionaryListOutput = z
  .object({
    signs: z.array(signSchema),
    total: z.number(),
  })
  .meta({
    examples: [
      {
        signs: [
          {
            code: "A",
            description: "Kepalkan tangan dengan ibu jari berada tegak di samping jari telunjuk.",
            difficulty: 1,
            meaning: "Huruf A",
            media: [
              {
                duration: null,
                thumbnail: null,
                type: "IMAGE",
                url: "https://bisara.app/signs/a.png",
              },
            ],
            word: "A",
          },
        ],
        total: 1,
      },
    ],
  });

export const dictionaryDetailOutput = signSchema.meta({
  examples: [
    {
      code: "A",
      description: "Kepalkan tangan dengan ibu jari berada tegak di samping jari telunjuk.",
      difficulty: 1,
      meaning: "Huruf A",
      media: [],
      word: "A",
    },
  ],
});
