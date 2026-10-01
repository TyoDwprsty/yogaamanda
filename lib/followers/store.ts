import "server-only";

import { after } from "next/server";
import { z } from "zod";
import { db, hasDatabase } from "@/lib/db";
import { FOLLOWER_PLATFORMS, type FollowerAccount, type FollowerPlatform, type SiteContent } from "@/lib/content/schema";
import { fetchFollowerCount } from "./fetchers";
import { normalizeHandle, profileUrl } from "./shared";

// Automatically read counts are kept in their own SiteSection row (not part of the
// editable content), so a failed fetch never overwrites what the admin typed.

const SNAPSHOT_KEY = "followers:snapshot";
/** Re-read counts this long after the last successful read... */
const FRESH_MS = 6 * 60 * 60 * 1000;
/** ...but wait at least this long after a failed attempt before trying again. */
const RETRY_MS = 60 * 60 * 1000;

const entrySchema = z.object({
  username: z.string(),
  count: z.number().nullable(),
  fetchedAt: z.string().nullable(),
  attemptedAt: z.string(),
  error: z.string().nullable(),
});
const snapshotSchema = z.partialRecord(z.enum(FOLLOWER_PLATFORMS), entrySchema);

export type FollowerSnapshotEntry = z.infer<typeof entrySchema>;
export type FollowerSnapshot = z.infer<typeof snapshotSchema>;

export async function readFollowerSnapshot(): Promise<FollowerSnapshot> {
  if (!hasDatabase) return {};
  const row = await db().siteSection.findUnique({ where: { key: SNAPSHOT_KEY } });
  const parsed = snapshotSchema.safeParse(row?.data ?? {});
  return parsed.success ? parsed.data : {};
}

async function writeFollowerSnapshot(snapshot: FollowerSnapshot) {
  await db().siteSection.upsert({
    where: { key: SNAPSHOT_KEY },
    create: { key: SNAPSHOT_KEY, data: snapshot },
    update: { data: snapshot },
  });
}

/**
 * Fetches counts for the given accounts and stores the results. A failure keeps the
 * previous good count (when the username hasn't changed) and records the error.
 */
export async function refreshFollowerCounts(accounts: FollowerAccount[]): Promise<FollowerSnapshot> {
  const prev = await readFollowerSnapshot();
  const next: FollowerSnapshot = { ...prev };
  const now = new Date().toISOString();

  await Promise.all(
    accounts.map(async (a) => {
      const username = normalizeHandle(a.platform, a.username);
      if (!username) return;
      const old = prev[a.platform]?.username === username ? prev[a.platform] : undefined;
      try {
        const count = await fetchFollowerCount(a.platform, username);
        next[a.platform] = { username, count, fetchedAt: now, attemptedAt: now, error: null };
      } catch (err) {
        next[a.platform] = {
          username,
          count: old?.count ?? null,
          fetchedAt: old?.fetchedAt ?? null,
          attemptedAt: now,
          error: (err as Error).message,
        };
      }
    }),
  );

  if (hasDatabase) await writeFollowerSnapshot(next);
  return next;
}

function isStale(entry: FollowerSnapshotEntry | undefined, username: string, now: number) {
  if (!entry || entry.username !== username) return true;
  if (entry.error) return now - Date.parse(entry.attemptedAt) > RETRY_MS;
  return !entry.fetchedAt || now - Date.parse(entry.fetchedAt) > FRESH_MS;
}

let backgroundRefresh: Promise<unknown> | null = null;

export type FollowerStat = {
  platform: FollowerPlatform;
  username: string;
  url: string;
  count: number;
};

export type FollowerStats = {
  items: FollowerStat[];
  total: number;
  /** Date of the oldest automatic reading, when every shown number came from one. */
  asOf: string | null;
};

/**
 * The numbers to show on the site. Uses the stored automatic readings and, when they
 * are stale, refreshes them in the background after the page has rendered; the page
 * picks the new numbers up on its next regeneration.
 */
export async function getFollowerStats(proof: SiteContent["proof"]): Promise<FollowerStats> {
  let snapshot: FollowerSnapshot = {};
  try {
    snapshot = await readFollowerSnapshot();
  } catch (err) {
    console.error("readFollowerSnapshot failed", err);
  }

  const now = Date.now();
  const stale: FollowerAccount[] = [];
  const items: FollowerStat[] = [];
  const autoDates: string[] = [];
  let allAuto = true;

  for (const a of proof.followers) {
    const username = normalizeHandle(a.platform, a.username);
    if (!a.show || !username) continue;

    const entry = snapshot[a.platform];
    let count = a.count;
    if (a.mode === "auto") {
      if (isStale(entry, username, now)) stale.push(a);
      if (entry?.username === username && entry.count != null && entry.fetchedAt) {
        count = entry.count;
        autoDates.push(entry.fetchedAt);
      } else {
        allAuto = false;
      }
    } else {
      allAuto = false;
    }
    if (count > 0) items.push({ platform: a.platform, username, url: profileUrl(a.platform, username), count });
  }

  if (hasDatabase && stale.length && !backgroundRefresh) {
    after(() => {
      // One background refresh per server process at a time.
      backgroundRefresh ??= refreshFollowerCounts(stale)
        .catch((err) => console.error("refreshFollowerCounts failed", err))
        .finally(() => {
          backgroundRefresh = null;
        });
      return backgroundRefresh;
    });
  }

  return {
    items,
    total: items.reduce((n, i) => n + i.count, 0),
    asOf: allAuto && autoDates.length ? autoDates.sort()[0] : null,
  };
}
