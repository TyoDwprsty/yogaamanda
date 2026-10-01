import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Same files Next.js reads, local overrides first.
config({ path: [".env.local", ".env"], quiet: true });

/**
 * Migrations need a direct connection: Neon's pooler (PgBouncer, transaction mode)
 * doesn't keep the session-level lock `prisma migrate` relies on. Use DIRECT_URL when
 * set, otherwise derive it from a Neon pooled DATABASE_URL by dropping "-pooler" from
 * the host. The app itself keeps using the pooled DATABASE_URL.
 */
function migrationUrl() {
  if (process.env.DIRECT_URL) return process.env.DIRECT_URL;
  const url = process.env.DATABASE_URL;
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.endsWith(".neon.tech")) u.hostname = u.hostname.replace("-pooler.", ".");
    return u.toString();
  } catch {
    return url;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // Not needed for `prisma generate`; required for migrate/studio.
    url: migrationUrl(),
  },
});
