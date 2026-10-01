import { blobStore, IMMUTABLE } from "@/lib/blob";

// Serves uploaded media from a private bucket (or the local folder), including byte
// ranges so videos stream and seek. Responses are immutable, so browsers and CDNs
// keep them and most visits never reach this handler again.
const CACHE = `${IMMUTABLE}, s-maxage=31536000`;

export async function GET(request: Request, ctx: RouteContext<"/files/[...path]">) {
  const key = (await ctx.params).path.join("/");
  // Only finished media; anything else (incoming/, odd paths) is rejected outright.
  if (!/^media\/[a-z0-9-]{8,64}\.[a-z0-9]{2,5}$/.test(key)) return new Response("Not found", { status: 404 });

  const res = await blobStore().read(key, request.headers.get("range"));
  if (!res) return new Response("Not found", { status: 404 });
  if (res.status === 416) {
    return new Response(null, { status: 416, headers: res.size ? { "Content-Range": `bytes */${res.size}` } : {} });
  }
  if (res.etag && request.headers.get("if-none-match") === res.etag) {
    await res.body?.cancel();
    return new Response(null, { status: 304, headers: { ETag: res.etag, "Cache-Control": CACHE } });
  }

  const headers: Record<string, string> = {
    "Content-Type": res.contentType ?? "application/octet-stream",
    "Accept-Ranges": "bytes",
    "Cache-Control": CACHE,
  };
  if (res.length !== undefined) headers["Content-Length"] = String(res.length);
  if (res.contentRange) headers["Content-Range"] = res.contentRange;
  if (res.etag) headers.ETag = res.etag;

  return new Response(res.body, { status: res.status, headers });
}
