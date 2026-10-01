import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth/session";
import { blobStore } from "@/lib/blob";
import { MAX_BYTES, UPLOAD_TYPES } from "@/lib/upload-rules";

/**
 * Step 1 of an upload: hands the browser a signed URL to PUT the file to.
 * Images go to incoming/ and are converted on finalize; videos go straight to media/.
 */
export async function POST(request: Request) {
  if (!(await getSession())) return Response.json({ error: "Sesi berakhir, silakan login lagi." }, { status: 401 });

  const { type, size } = (await request.json().catch(() => ({}))) as { type?: string; size?: number };
  const info = type ? UPLOAD_TYPES[type] : undefined;
  if (!info) {
    return Response.json({ error: "Format tidak didukung. Pakai JPG, PNG, WebP, AVIF, GIF, MP4, atau WebM." }, { status: 415 });
  }
  if (!size || size <= 0) return Response.json({ error: "File kosong." }, { status: 400 });
  if (size > MAX_BYTES[info.kind]) {
    return Response.json({ error: `File terlalu besar (maks ${MAX_BYTES[info.kind] / 1024 / 1024}MB).` }, { status: 413 });
  }

  const store = blobStore();
  const key = `${info.kind === "image" ? "incoming" : "media"}/${randomUUID()}.${info.ext}`;
  const { url, headers } = await store.signUpload(key, type!);
  return Response.json({ key, uploadUrl: url, headers, kind: info.kind });
}
