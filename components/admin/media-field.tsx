"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ImageIcon, PlayIcon } from "@/components/icons";
import type { MediaKind } from "@/lib/upload-rules";
import { inputClass } from "./fields";
import { uploadMedia } from "./uploader";

type Kind = MediaKind;

const ACCEPT: Record<Kind, string> = {
  image: "image/jpeg,image/png,image/webp,image/avif,image/gif",
  video: "video/mp4,video/webm",
};

const fmt = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.ceil(n / 1024)}KB`);

/**
 * Upload or pick a media file. The preview box uses a fixed aspect ratio, matching
 * how the item is shown on the site, so you see the crop before saving.
 */
export function MediaField({
  label,
  kind,
  value,
  onChange,
  aspect = "16/9",
  hint,
}: {
  label: string;
  kind: Kind;
  value: string;
  /** `poster` is set when a video upload produced a poster frame. */
  onChange: (url: string, poster?: string) => void;
  aspect?: string;
  hint?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setInfo(null);
    setWarning(null);
    setProgress(0);
    try {
      const res = await uploadMedia(file, kind, setProgress);
      onChange(res.url, res.poster);
      setWarning(res.warning ?? null);
      setInfo(`${file.name} · ${fmt(file.size)} terunggah`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink">
        {label}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className="relative w-full shrink-0 overflow-hidden rounded-2xl border border-line bg-bg sm:w-48"
          style={{ aspectRatio: aspect }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pick(e.dataTransfer.files[0]);
          }}
        >
          {value ? (
            kind === "image" ? (
              <Image src={value} alt="" fill sizes="192px" className="object-cover" />
            ) : (
              <>
                <video src={value} muted playsInline preload="metadata" className="absolute inset-0 size-full object-cover" />
                <span className="absolute top-2 left-2 grid size-7 place-items-center rounded-full bg-black/50 text-white">
                  <PlayIcon size={12} />
                </span>
              </>
            )
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted">
              <ImageIcon size={22} />
              <span className="text-[11px] font-medium">Kosong</span>
            </div>
          )}
          {progress !== null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm">
              <span className="text-sm font-bold text-white">{Math.round(progress * 100)}%</span>
              <div className="h-1 w-3/4 overflow-hidden rounded-full bg-white/20">
                <div className="h-full bg-gradient-to-r from-gold-hi to-gold transition-[width]" style={{ width: `${progress * 100}%` }} />
              </div>
              {progress >= 1 && <span className="text-[11px] text-white/80">Mengoptimalkan…</span>}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={progress !== null}
              className="btn-gold h-10 cursor-pointer rounded-full px-4 text-[13px] font-semibold disabled:opacity-60"
            >
              {value ? "Ganti file" : `Upload ${kind === "image" ? "gambar" : "video"}`}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="btn-ghost h-10 cursor-pointer rounded-full px-4 text-[13px] font-semibold text-muted"
              >
                Kosongkan
              </button>
            )}
          </div>
          <input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/files/media/... atau https://..."
            className={`${inputClass} h-10 text-[13px]`}
          />
          <input ref={inputRef} type="file" accept={ACCEPT[kind]} hidden onChange={(e) => pick(e.target.files?.[0])} />
          {error ? (
            <span className="text-[12.5px] font-medium text-[#e5866b]">{error}</span>
          ) : warning ? (
            <span className="text-[12.5px] font-medium text-[#e5a85b]">{warning}</span>
          ) : info ? (
            <span className="text-[12.5px] text-gold-text">{info}</span>
          ) : (
            <span className="text-[12.5px] text-muted">
              {hint ??
                (kind === "image"
                  ? "Otomatis dikonversi ke WebP kualitas tinggi. Bisa drag & drop."
                  : "MP4 (H.264), export dengan opsi Fast Start. Poster dibuat otomatis. Bisa drag & drop.")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
