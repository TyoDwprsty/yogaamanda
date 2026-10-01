// Signed session tokens (HMAC-SHA256). Uses Web Crypto only, so it runs in proxy.ts,
// route handlers and server actions alike.

export const SESSION_COOKIE = "ya_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

type Payload = { sub: string; exp: number };

const enc = new TextEncoder();

function b64url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET belum di-set (minimal 32 karakter). Lihat .env.example.");
  }
  return s;
}

let cachedKey: { secret: string; key: Promise<CryptoKey> } | null = null;

function key() {
  const s = secret();
  if (cachedKey?.secret !== s) {
    cachedKey = {
      secret: s,
      key: crypto.subtle.importKey("raw", enc.encode(s), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]),
    };
  }
  return cachedKey.key;
}

export async function signSession(sub: string) {
  const payload: Payload = { sub, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await key(), enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined): Promise<Payload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(), fromB64url(sig), enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Payload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
