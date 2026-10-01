"use client";

import { useState } from "react";
import { PlayIcon } from "@/components/icons";

export function youTubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

/** Click-to-load YouTube: only a thumbnail until the visitor presses play. */
export function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const id = youTubeId(url);
  const [on, setOn] = useState(false);
  if (!id) return null;

  if (on) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    );
  }

  return (
    <button type="button" onClick={() => setOn(true)} aria-label={`Putar ${title}`} className="group/video absolute inset-0 cursor-pointer">
      {/* eslint-disable-next-line @next/next/no-img-element -- remote thumbnail, already sized by YouTube */}
      <img
        src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover/video:scale-[1.02]"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/5" />
      <span className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black transition-transform duration-500 group-hover/video:scale-105 md:size-[84px]">
        <PlayIcon size={30} className="translate-x-0.5" />
      </span>
      <span className="absolute bottom-4 left-4 text-xs font-medium text-white/90 md:bottom-6 md:left-6 md:text-sm">{title}</span>
    </button>
  );
}
