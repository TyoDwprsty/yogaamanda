import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createReadStream } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

/**
 * Where uploaded media lives.
 *
 * - S3-compatible object storage (Neon Storage now, Cloudflare R2 later) when the
 *   AWS_* / S3_BUCKET variables are set. Browsers upload straight to the bucket with a
 *   short-lived signed URL, so large videos never pass through the app server.
 * - Otherwise a local folder (./storage/uploads), for development without credentials.
 *
 * Visitors load files from S3_PUBLIC_URL when the bucket is public (e.g. R2 with a custom
 * domain); otherwise through this app at /files/<key> (app/files/[...path]/route.ts).
 */
export interface BlobStore {
  driver: "s3" | "local";
  publicUrl(key: string): string;
  /** URL + headers the browser must use to PUT the file. */
  signUpload(key: string, contentType: string): Promise<{ url: string; headers: Record<string, string> }>;
  put(key: string, body: Uint8Array, contentType: string): Promise<void>;
  get(key: string): Promise<Uint8Array | null>;
  size(key: string): Promise<number | null>;
  remove(key: string): Promise<void>;
  /** Streams a file (optionally a byte range) for the /files route. */
  read(key: string, range: string | null): Promise<BlobRead | null>;
}

export type BlobRead = {
  status: 200 | 206 | 416;
  body: ReadableStream | null;
  size?: number;
  length?: number;
  contentRange?: string;
  contentType?: string;
  etag?: string;
};

/** Upload keys are random or content-hashed, so a file never changes: cache it for a year. */
export const IMMUTABLE = "public, max-age=31536000, immutable";

const MIME: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  png: "image/png",
  avif: "image/avif",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
};
const mimeOf = (key: string) => MIME[key.split(".").pop() ?? ""] ?? "application/octet-stream";

const filesUrl = (key: string) => `/files/${key}`;

function publicBase() {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/+$/, "");
  return base ? (key: string) => `${base}/${key}` : filesUrl;
}

function notFound(err: unknown) {
  return err instanceof S3ServiceException && (err.$metadata.httpStatusCode === 404 || err.name === "NoSuchKey" || err.name === "NotFound");
}

function s3Store(): BlobStore | null {
  const { AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET } = process.env;
  if (!AWS_ENDPOINT_URL_S3 || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET) return null;

  const Bucket = S3_BUCKET;
  // Endpoint, keys and region come from the standard AWS_* variables.
  const s3 = new S3Client({
    forcePathStyle: true,
    region: process.env.AWS_REGION || "auto",
    // Only add checksums when the API demands it; S3-compatible stores (R2, Neon)
    // don't all accept the SDK's default CRC headers on signed URLs.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return {
    driver: "s3",
    publicUrl: publicBase(),
    async signUpload(key, contentType) {
      const url = await getSignedUrl(
        s3,
        new PutObjectCommand({ Bucket, Key: key, ContentType: contentType, CacheControl: IMMUTABLE }),
        { expiresIn: 900 },
      );
      return { url, headers: { "Content-Type": contentType, "Cache-Control": IMMUTABLE } };
    },
    async put(key, body, contentType) {
      await s3.send(new PutObjectCommand({ Bucket, Key: key, Body: body, ContentType: contentType, CacheControl: IMMUTABLE }));
    },
    async get(key) {
      try {
        const res = await s3.send(new GetObjectCommand({ Bucket, Key: key }));
        return res.Body ? await res.Body.transformToByteArray() : null;
      } catch (err) {
        if (notFound(err)) return null;
        throw err;
      }
    },
    async size(key) {
      try {
        return (await s3.send(new HeadObjectCommand({ Bucket, Key: key }))).ContentLength ?? 0;
      } catch (err) {
        if (notFound(err)) return null;
        throw err;
      }
    },
    async remove(key) {
      await s3.send(new DeleteObjectCommand({ Bucket, Key: key }));
    },
    async read(key, range) {
      try {
        const res = await s3.send(new GetObjectCommand({ Bucket, Key: key, Range: range ?? undefined }));
        const partial = Boolean(res.ContentRange);
        return {
          status: partial ? 206 : 200,
          body: res.Body ? (res.Body.transformToWebStream() as ReadableStream) : null,
          length: res.ContentLength,
          contentRange: res.ContentRange,
          contentType: res.ContentType || mimeOf(key),
          etag: res.ETag,
        };
      } catch (err) {
        if (notFound(err)) return null;
        if (err instanceof S3ServiceException && err.$metadata.httpStatusCode === 416) return { status: 416, body: null };
        throw err;
      }
    },
  };
}

// The turbopackIgnore hints keep the build from tracing (and shipping) the whole
// project because of these runtime paths.
export const LOCAL_UPLOADS_DIR = path.resolve(
  /*turbopackIgnore: true*/ process.env.STORAGE_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "storage"),
  "uploads",
);

export function localPath(key: string) {
  const file = path.join(/*turbopackIgnore: true*/ LOCAL_UPLOADS_DIR, key);
  if (!file.startsWith(LOCAL_UPLOADS_DIR + path.sep)) throw new Error("Invalid key");
  return file;
}

function localStore(): BlobStore {
  return {
    driver: "local",
    publicUrl: filesUrl,
    async signUpload(key, contentType) {
      // Same-origin PUT, authenticated by the admin session cookie.
      return { url: `/api/admin/upload/local/${key}`, headers: { "Content-Type": contentType } };
    },
    async put(key, body) {
      const file = localPath(key);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, body);
    },
    async get(key) {
      try {
        return new Uint8Array(await readFile(localPath(key)));
      } catch {
        return null;
      }
    },
    async size(key) {
      try {
        return (await stat(localPath(key))).size;
      } catch {
        return null;
      }
    },
    async remove(key) {
      await rm(localPath(key), { force: true });
    },
    async read(key, range) {
      const file = localPath(key);
      let size: number;
      try {
        size = (await stat(file)).size;
      } catch {
        return null;
      }
      const toWeb = (s: Readable) => Readable.toWeb(s) as unknown as ReadableStream;
      const base = { size, contentType: mimeOf(key), etag: `"${path.basename(key).split(".")[0]}"` };

      const m = range?.match(/^bytes=(\d*)-(\d*)$/);
      if (m && (m[1] || m[2])) {
        const start = Math.max(0, m[1] ? Number(m[1]) : size - Number(m[2]));
        const end = Math.min(m[1] && m[2] ? Number(m[2]) : size - 1, size - 1);
        if (start > end || start >= size) return { status: 416, body: null, size };
        return {
          ...base,
          status: 206,
          body: toWeb(createReadStream(file, { start, end })),
          length: end - start + 1,
          contentRange: `bytes ${start}-${end}/${size}`,
        };
      }
      return { ...base, status: 200, body: toWeb(createReadStream(file)), length: size };
    },
  };
}

let store: BlobStore | null = null;

export function blobStore() {
  store ??= s3Store() ?? localStore();
  return store;
}
