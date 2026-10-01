import "server-only";

import { db, hasDatabase } from "@/lib/db";
import { defaultContent } from "./defaults";
import { sectionSchemas, siteContentSchema, type SectionKey, type SiteContent } from "./schema";

/**
 * Site content: one database row per section. Sections that were never saved, or
 * whose stored data no longer matches the schema, fall back to the defaults.
 * Without a database the site simply renders the defaults.
 */
export async function getContent(): Promise<SiteContent> {
  if (!hasDatabase) return defaultContent;

  const rows = await db().siteSection.findMany();
  const merged = { ...defaultContent };
  for (const row of rows) {
    const key = row.key as SectionKey;
    const schema = sectionSchemas[key];
    if (!schema) continue;
    const parsed = schema.safeParse(row.data);
    if (parsed.success) (merged as Record<SectionKey, unknown>)[key] = parsed.data;
  }
  return siteContentSchema.parse(merged);
}

export async function saveSection<K extends SectionKey>(key: K, value: SiteContent[K]) {
  await db().siteSection.upsert({
    where: { key },
    create: { key, data: value },
    update: { data: value },
  });
}
