import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

export const hasDatabase = Boolean(process.env.DATABASE_URL);

// One client (and connection pool) per server process. In development the module is
// re-evaluated on every edit, so the instance is parked on globalThis.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function create() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export function db() {
  if (!hasDatabase) {
    throw new Error("DATABASE_URL belum di-set. Lihat .env.example.");
  }
  globalForPrisma.prisma ??= create();
  return globalForPrisma.prisma;
}
