import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  return new PrismaClient({ adapter, log: ["query"] });
};

const globalForPrisma = globalThis as typeof globalThis & {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
};

export const db = globalForPrisma.prismaGlobal ?? prismaClientSingleton();

globalForPrisma.prismaGlobal ??= db;
