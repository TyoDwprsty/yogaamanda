import "server-only";

import type { FollowerPlatform } from "@/lib/content/schema";
import { isYouTubeChannelId } from "./shared";

// Reads public follower counts without paid APIs.
// - YouTube: the official Data API when YOUTUBE_API_KEY is set (free quota), otherwise the
//   channel page.
// - TikTok and Instagram: their public profile data. Neither offers a free official
//   endpoint for this, so these can break or get rate-limited; the manual count is the
//   fallback.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const TIMEOUT_MS = 9000;

export class FetchCountError extends Error {}

/** The low-level reason behind a failed fetch, e.g. "ECONNRESET" or "ENOTFOUND". */
function networkCause(err: unknown) {
  const cause = (err as { cause?: { code?: string; message?: string } })?.cause;
  return cause?.code ?? cause?.message;
}

async function get(url: string, headers: Record<string, string> = {}) {
  const attempt = () =>
    fetch(url, {
      headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9", ...headers },
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  let res: Response;
  try {
    // Platforms sometimes drop a server's connection outright; one quick retry rides out a blip.
    res = await attempt().catch(async (err) => {
      if ((err as Error).name === "TimeoutError") throw err;
      await new Promise((r) => setTimeout(r, 1500));
      return attempt();
    });
  } catch (err) {
    if ((err as Error).name === "TimeoutError") throw new FetchCountError("Waktu habis saat menghubungi server.");
    const cause = networkCause(err);
    throw new FetchCountError(`Gagal terhubung${cause ? ` (${cause})` : ""}. Biasanya platform menolak koneksi dari server.`);
  }
  if (res.status === 404) throw new FetchCountError("Akun tidak ditemukan (404). Cek username.");
  if (res.status === 429) throw new FetchCountError("Dibatasi oleh platform (429). Coba lagi nanti atau isi manual.");
  if (res.status === 401 || res.status === 403) throw new FetchCountError(`Diblokir oleh platform (${res.status}). Isi manual dulu.`);
  return res;
}

/** "12.3K" → 12300, "1,234" → 1234, "2.1M" → 2100000. */
export function parseCompact(s: string) {
  const m = s.trim().match(/^([\d.,]+)\s*([KMB])?/i);
  if (!m) return null;
  const unit = m[2]?.toUpperCase();
  const num = unit ? parseFloat(m[1].replace(/,/g, "")) : parseInt(m[1].replace(/[.,]/g, ""), 10);
  if (!Number.isFinite(num)) return null;
  const mult = unit === "K" ? 1e3 : unit === "M" ? 1e6 : unit === "B" ? 1e9 : 1;
  return Math.round(num * mult);
}

async function tiktok(handle: string) {
  const res = await get(`https://www.tiktok.com/@${encodeURIComponent(handle)}`);
  const html = await res.text();
  const script = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
  if (script) {
    try {
      const data = JSON.parse(script[1]);
      const detail = data?.__DEFAULT_SCOPE__?.["webapp.user-detail"];
      if (detail?.statusCode === 10221 || detail?.statusCode === 10202) throw new FetchCountError("Akun tidak ditemukan. Cek username.");
      const n = detail?.userInfo?.stats?.followerCount ?? detail?.userInfo?.statsV2?.followerCount;
      if (n != null && Number.isFinite(Number(n))) return Number(n);
    } catch (err) {
      if (err instanceof FetchCountError) throw err;
    }
  }
  const loose = html.match(/"followerCount":"?(\d+)/);
  if (loose) return Number(loose[1]);
  throw new FetchCountError("Angka pengikut tidak terbaca dari halaman TikTok.");
}

async function instagram(handle: string) {
  // The web API gives the exact number but often answers 401/429 to servers.
  try {
    const res = await get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`, {
      accept: "*/*",
      "x-ig-app-id": "936619743392459",
      referer: `https://www.instagram.com/${encodeURIComponent(handle)}/`,
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      const n = data?.data?.user?.edge_followed_by?.count;
      if (typeof n === "number") return n;
    }
  } catch (err) {
    if (!(err instanceof FetchCountError)) throw err;
  }
  // Fallback: the description Instagram serves to link-preview crawlers, e.g.
  // "525 Followers, 161 Following, ..." (rounded to "12K" for larger accounts).
  const page = await get(`https://www.instagram.com/${encodeURIComponent(handle)}/`, {
    "user-agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  });
  const html = await page.text();
  const m = html.match(/content="([\d.,]+\s*[KMB]?)\s+Followers/i);
  const n = m && parseCompact(m[1]);
  if (n != null) return n;
  throw new FetchCountError("Instagram tidak memberi angka (biasanya karena dibatasi). Isi manual.");
}

async function youtube(handle: string) {
  const key = process.env.YOUTUBE_API_KEY;
  const isId = isYouTubeChannelId(handle);
  if (key) {
    const q = isId ? `id=${handle}` : `forHandle=${encodeURIComponent("@" + handle)}`;
    const res = await get(`https://www.googleapis.com/youtube/v3/channels?part=statistics&${q}&key=${key}`);
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new FetchCountError(data?.error?.message ?? `YouTube API error (${res.status}).`);
    const stats = data?.items?.[0]?.statistics;
    if (!stats) throw new FetchCountError("Channel tidak ditemukan. Cek username.");
    if (stats.hiddenSubscriberCount) throw new FetchCountError("Jumlah subscriber channel ini disembunyikan.");
    return Number(stats.subscriberCount);
  }
  const url = isId ? `https://www.youtube.com/channel/${handle}` : `https://www.youtube.com/@${encodeURIComponent(handle)}`;
  // The consent cookie skips the EU cookie wall that would otherwise replace the page.
  const res = await get(url, { cookie: "SOCS=CAI; CONSENT=YES+1" });
  const html = await res.text();
  const m =
    html.match(/"subscriberCountText":\{[^}]*?"simpleText":"([\d.,]+\s*[KMB]?) subscribers?"/i) ??
    html.match(/"content":"([\d.,]+\s*[KMB]?) subscribers?"/i);
  const n = m && parseCompact(m[1]);
  if (n != null) return n;
  throw new FetchCountError("Angka subscriber tidak terbaca. Isi YOUTUBE_API_KEY atau isi manual.");
}

const FETCHERS: Record<FollowerPlatform, (handle: string) => Promise<number>> = { tiktok, instagram, youtube };

export async function fetchFollowerCount(platform: FollowerPlatform, handle: string): Promise<number> {
  if (!handle) throw new FetchCountError("Username belum diisi.");
  try {
    return await FETCHERS[platform](handle);
  } catch (err) {
    if (err instanceof FetchCountError) throw err;
    console.error(`fetchFollowerCount(${platform})`, err);
    throw new FetchCountError("Terjadi kesalahan saat membaca angka.");
  }
}
