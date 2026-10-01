import type { FollowerPlatform } from "@/lib/content/schema";

// Helpers shared by the site, the admin panel and the server-side fetchers.

export const PLATFORM_NAME: Record<FollowerPlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
};

/** What the number counts, in the site's language. */
export const COUNT_NOUN: Record<FollowerPlatform, string> = {
  tiktok: "pengikut",
  instagram: "pengikut",
  youtube: "subscriber",
};

const HOSTS: Record<FollowerPlatform, RegExp> = {
  tiktok: /tiktok\.com\/@?([^/?#]+)/i,
  instagram: /instagram\.com\/([^/?#]+)/i,
  youtube: /youtube\.com\/(?:@([^/?#]+)|channel\/([^/?#]+)|c\/([^/?#]+)|user\/([^/?#]+))/i,
};

/** "@name", "name" or a pasted profile link → "name". */
export function normalizeHandle(platform: FollowerPlatform, input: string) {
  const raw = input.trim();
  const m = raw.match(HOSTS[platform]);
  const handle = m ? (m.slice(1).find(Boolean) ?? "") : raw;
  return decodeURIComponent(handle).replace(/^@/, "").trim();
}

/** YouTube channel ids (UC + 22 chars) are linked differently from @handles. */
export function isYouTubeChannelId(handle: string) {
  return /^UC[\w-]{22}$/.test(handle);
}

export function profileUrl(platform: FollowerPlatform, input: string) {
  const h = normalizeHandle(platform, input);
  if (!h) return "";
  const e = encodeURIComponent(h);
  if (platform === "tiktok") return `https://www.tiktok.com/@${e}`;
  if (platform === "instagram") return `https://www.instagram.com/${e}/`;
  return isYouTubeChannelId(h) ? `https://www.youtube.com/channel/${h}` : `https://www.youtube.com/@${e}`;
}

const compact = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });
const full = new Intl.NumberFormat("id-ID");

/** 128400 → "128,4 rb", 1250000 → "1,3 jt". */
export function formatCount(n: number) {
  return n < 10_000 ? full.format(n) : compact.format(n);
}

export function formatFull(n: number) {
  return full.format(n);
}

export function formatDate(iso: string, withTime = false) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}
