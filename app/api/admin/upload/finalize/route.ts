import { createHash } from "node:crypto";
import sharp from "sharp";
import { getSession } from "@/lib/auth/session";
import { blobStore } from "@/lib/blob";
import { KEY_PATTERN, MAX_BYTES } from "@/lib/upload-rules";

const MAX_IMAGE_WIDTH = 2560;

/**
 * Step 2 of an upload, after the browser has PUT the file.
 * Images: re-encoded to high-quality WebP (animated GIF → animated WebP, very wide images
 * scaled to 2560px), stored under a content hash, original removed.
 * Videos: checked for size and returned as-is.
 */
export async function POST(request: Request) {
  if (!(await getSession())) return Response.json({ error: "Sesi berakhir, silakan login lagi." }, { status: 401 });

  const { key } = (await request.json().catch(() => ({}))) as { key?: string };
  if (!key || !KEY_PATTERN.test(key)) return Response.json({ error: "Key tidak valid." }, { status: 400 });

  const store = blobStore();
  try {
    if (key.startsWith("media/")) {
      const size = await store.size(key);
      if (size === null) return Response.json({ error: "File belum terunggah." }, { status: 404 });
      if (size > MAX_BYTES.video) {
        await store.remove(key);
        return Response.json({ error: "File terlalu besar." }, { status: 413 });
      }
      return Response.json({ url: store.publicUrl(key), kind: "video", size });
    }

    const input = await store.get(key);
    if (!input) return Response.json({ error: "File belum terunggah." }, { status: 404 });
    if (input.byteLength > MAX_BYTES.image) {
      await store.remove(key);
      return Response.json({ error: "File terlalu besar." }, { status: 413 });
    }

    const animated = key.endsWith(".gif") || key.endsWith(".webp");
    const img = sharp(input, { animated }).rotate();
    const meta = await img.metadata();
    if ((meta.width ?? 0) > MAX_IMAGE_WIDTH) img.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true });
    const { data, info } = await img.webp({ quality: 90, effort: 5 }).toBuffer({ resolveWithObject: true });

    const finalKey = `media/${createHash("sha256").update(data).digest("hex").slice(0, 24)}.webp`;
    await store.put(finalKey, data, "image/webp");
    await store.remove(key);

    return Response.json({
      url: store.publicUrl(finalKey),
      kind: "image",
      width: info.width,
      height: meta.pageHeight ?? info.height,
      size: data.byteLength,
    });
  } catch (err) {
    console.error("finalize failed", err);
    return Response.json({ error: "Gagal memproses file. Coba lagi." }, { status: 500 });
  }
}
