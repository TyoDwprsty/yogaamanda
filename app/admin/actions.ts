"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkCredentials, createSession, destroySession, getSession } from "@/lib/auth/session";
import { z } from "zod";
import { followerAccountSchema, sectionSchemas, type SectionKey, type SiteContent } from "@/lib/content/schema";
import { refreshFollowerCounts, type FollowerSnapshot } from "@/lib/followers/store";
import { saveSection as persistSection } from "@/lib/content/store";
import { hasDatabase } from "@/lib/db";
import { markAllRead as markAll, removeMessage, setRead } from "@/lib/messages";

// ───────────── Auth ─────────────

export type LoginState = { error?: string; username?: string };

const attempts = new Map<string, number[]>();
const ATTEMPT_WINDOW = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < ATTEMPT_WINDOW);
  if (recent.length >= MAX_ATTEMPTS) {
    return { error: "Terlalu banyak percobaan. Tunggu beberapa menit.", username };
  }

  let ok = false;
  try {
    ok = checkCredentials(username, password);
  } catch (err) {
    return { error: (err as Error).message, username };
  }
  if (!ok) {
    attempts.set(ip, [...recent, now]);
    return { error: "Username atau password salah.", username };
  }

  attempts.delete(ip);
  await createSession(username);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

async function assertAdmin() {
  if (!(await getSession())) throw new Error("UNAUTHORIZED");
}

// ───────────── Content ─────────────

export type SaveResult = { ok: true } | { ok: false; error: string; issues?: { path: string; message: string }[] };

export async function saveSection<K extends SectionKey>(key: K, value: SiteContent[K]): Promise<SaveResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Sesi berakhir. Silakan login lagi." };
  }
  const schema = sectionSchemas[key];
  if (!schema) return { ok: false, error: "Bagian tidak dikenal." };

  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Ada isian yang belum valid.",
      issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    };
  }

  try {
    await persistSection(key, parsed.data as SiteContent[K]);
  } catch (err) {
    console.error("saveSection failed", err);
    return { ok: false, error: "Gagal menyimpan ke database. Cek DATABASE_URL lalu coba lagi." };
  }
  revalidatePath("/");
  return { ok: true };
}

// ───────────── Followers ─────────────

export type FollowerRefreshResult = { ok: true; snapshot: FollowerSnapshot; saved: boolean } | { ok: false; error: string };

/** Reads the counts now for the accounts as they are in the form (saved or not). */
export async function refreshFollowers(accounts: unknown): Promise<FollowerRefreshResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Sesi berakhir. Silakan login lagi." };
  }
  const parsed = z.array(followerAccountSchema).max(3).safeParse(accounts);
  if (!parsed.success) return { ok: false, error: "Data akun tidak valid." };

  try {
    const snapshot = await refreshFollowerCounts(parsed.data);
    revalidatePath("/");
    return { ok: true, snapshot, saved: hasDatabase };
  } catch (err) {
    console.error("refreshFollowers failed", err);
    return { ok: false, error: "Gagal menyimpan hasil ke database." };
  }
}

// ───────────── Messages ─────────────

export async function setMessageRead(id: string, read: boolean) {
  await assertAdmin();
  await setRead(id, read);
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(id: string) {
  await assertAdmin();
  await removeMessage(id);
  revalidatePath("/admin", "layout");
}

export async function markAllRead() {
  await assertAdmin();
  await markAll();
  revalidatePath("/admin", "layout");
}
