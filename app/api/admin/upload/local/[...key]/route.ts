import { createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { getSession } from "@/lib/auth/session";
import { blobStore, localPath } from "@/lib/blob";
import { KEY_PATTERN, MAX_BYTES } from "@/lib/upload-rules";

/** Local stand-in for R2's signed PUT, used only when R2 isn't configured. */
export async function PUT(request: Request, ctx: RouteContext<"/api/admin/upload/local/[...key]">) {
  if (blobStore().driver !== "local") return new Response("Not found", { status: 404 });
  if (!(await getSession())) return Response.json({ error: "Sesi berakhir, silakan login lagi." }, { status: 401 });

  const key = (await ctx.params).key.join("/");
  if (!KEY_PATTERN.test(key) || !request.body) return Response.json({ error: "Key tidak valid." }, { status: 400 });

  const file = localPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  let size = 0;
  try {
    await pipeline(
      Readable.fromWeb(request.body as unknown as NodeReadableStream),
      new Transform({
        transform(chunk: Buffer, _enc, cb) {
          size += chunk.length;
          cb(size > MAX_BYTES.video ? new Error("too-large") : null, chunk);
        },
      }),
      createWriteStream(file),
    );
  } catch {
    await rm(file, { force: true });
    return Response.json({ error: "Upload gagal." }, { status: 400 });
  }
  return new Response(null, { status: 200 });
}
