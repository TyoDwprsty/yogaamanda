// Shared by the admin uploader (browser) and the upload API (server).

export type MediaKind = "image" | "video";

export const UPLOAD_TYPES: Record<string, { ext: string; kind: MediaKind }> = {
  "image/jpeg": { ext: "jpg", kind: "image" },
  "image/png": { ext: "png", kind: "image" },
  "image/webp": { ext: "webp", kind: "image" },
  "image/avif": { ext: "avif", kind: "image" },
  "image/gif": { ext: "gif", kind: "image" },
  "video/mp4": { ext: "mp4", kind: "video" },
  "video/webm": { ext: "webm", kind: "video" },
};

export const MAX_BYTES: Record<MediaKind, number> = {
  image: 30 * 1024 * 1024,
  video: 500 * 1024 * 1024,
};

/** Upload keys look like "incoming/<uuid>.jpg" or "media/<id>.mp4". */
export const KEY_PATTERN = /^(incoming|media)\/[a-z0-9-]{8,64}\.[a-z0-9]{2,5}$/;
