"use client";

import { MAX_BYTES, UPLOAD_TYPES, type MediaKind } from "@/lib/upload-rules";

export type UploadResult = { url: string; kind: MediaKind; poster?: string; warning?: string };

async function api<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload gagal.");
  return data as T;
}

function put(url: string, headers: Record<string, string>, body: Blob, onProgress?: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(xhr.status === 403 ? "Upload ditolak storage (cek CORS / kredensial storage)." : "Upload gagal."));
    xhr.onerror = () => reject(new Error("Koneksi terputus saat upload (cek CORS bucket)."));
    xhr.send(body);
  });
}

/** sign → PUT straight to storage → finalize (server converts images to WebP). */
async function send(file: Blob, type: string, onProgress?: (p: number) => void) {
  const signed = await api<{ key: string; uploadUrl: string; headers: Record<string, string> }>("/api/admin/upload/sign", {
    type,
    size: file.size,
  });
  await put(signed.uploadUrl, signed.headers, file, onProgress);
  return api<{ url: string; kind: MediaKind }>("/api/admin/upload/finalize", { key: signed.key });
}

/**
 * Grabs a frame from the video in the browser and returns it as an image, so videos get
 * a poster without any server-side video processing.
 */
async function capturePoster(file: File): Promise<Blob | null> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("decode"));
    });
    video.currentTime = Math.min(0.6, (video.duration || 1) / 2);
    await new Promise<void>((resolve) => (video.onseeked = () => resolve()));

    const scale = Math.min(1, 1600 / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * MP4s can only start playing before they finish downloading when the index ("moov")
 * comes before the media data ("mdat"). Walks the top-level boxes without reading the
 * whole file. Returns null when it can't tell.
 */
async function isFastStart(file: File): Promise<boolean | null> {
  if (file.type !== "video/mp4") return null;
  let offset = 0;
  for (let i = 0; i < 64 && offset + 8 <= file.size; i++) {
    const head = new DataView(await file.slice(offset, offset + 16).arrayBuffer());
    let size = head.getUint32(0);
    const type = String.fromCharCode(head.getUint8(4), head.getUint8(5), head.getUint8(6), head.getUint8(7));
    if (type === "moov") return true;
    if (type === "mdat") return false;
    if (size === 1) size = Number(head.getBigUint64(8));
    if (size === 0) return null;
    if (size < 8) return null;
    offset += size;
  }
  return null;
}

export async function uploadMedia(file: File, kind: MediaKind, onProgress: (p: number) => void): Promise<UploadResult> {
  const info = UPLOAD_TYPES[file.type];
  if (!info || info.kind !== kind) {
    throw new Error(kind === "image" ? "Pilih file gambar (JPG, PNG, WebP, AVIF, GIF)." : "Pilih file video MP4 atau WebM.");
  }
  if (file.size > MAX_BYTES[kind]) throw new Error(`File terlalu besar (maks ${MAX_BYTES[kind] / 1024 / 1024}MB).`);

  if (kind === "image") {
    const res = await send(file, file.type, onProgress);
    return { url: res.url, kind };
  }

  const fast = await isFastStart(file);
  const res = await send(file, file.type, (p) => onProgress(p * 0.95));
  let poster: string | undefined;
  const frame = await capturePoster(file);
  if (frame) poster = (await send(frame, "image/jpeg")).url;
  onProgress(1);

  return {
    url: res.url,
    kind,
    poster,
    warning:
      fast === false
        ? "Video belum “web optimized”: baru bisa diputar setelah banyak bagian terunduh. Saat export, aktifkan opsi Fast Start / Web Optimized."
        : undefined,
  };
}
