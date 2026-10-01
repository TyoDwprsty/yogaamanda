import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./token";

function sameSecret(a: string, b: string) {
  // Hash first so both buffers have equal length and the comparison stays constant-time.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkCredentials(username: string, password: string) {
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;
  if (!u || !p) throw new Error("ADMIN_USERNAME / ADMIN_PASSWORD belum di-set. Lihat .env.example.");
  // Evaluate both so timing doesn't reveal which one was wrong.
  const okUser = sameSecret(username, u);
  const okPass = sameSecret(password, p);
  return okUser && okPass;
}

export async function createSession(username: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

/** For server components and server actions: redirects to the login page when signed out. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
