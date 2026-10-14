import createHttpError from "http-errors";

import type { Prisma } from "@/generated/prisma/client";

import { db } from "@/lib/db";

const fullSignSelect = {
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

export const dictionaryService = {
  getSignDetail: async (code: string) => {
    const sign = await db.sign.findUnique({
      select: fullSignSelect,
      where: { code: code.toUpperCase() },
    });
    if (!sign) throw createHttpError(404, "Sign not found");
    return sign;
  },

  listSigns: async (params: {
    category?: "ALPHABET" | "NUMBER" | "VOCABULARY";
    limit: number;
    offset: number;
    search?: string;
  }) => {
    const where: Prisma.SignWhereInput = {};

    if (params.search) {
      where.OR = [
        { word: { contains: params.search, mode: "insensitive" } },
        { meaning: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.category) {
      where.materials = {
        some: {
          lesson: {
            category: {
              type: params.category,
            },
          },
        },
      };
    }

    const [signs, total] = await db.$transaction([
      db.sign.findMany({
        orderBy: { word: "asc" },
        select: fullSignSelect,
        skip: params.offset,
        take: params.limit,
        where,
      }),
      db.sign.count({ where }),
    ]);

    return {
      signs,
      total,
    };
  },
};
