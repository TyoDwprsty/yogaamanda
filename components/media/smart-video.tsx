"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ExpandIcon, MuteIcon, PauseIcon, PlayIcon, VolumeIcon } from "@/components/icons";

type Props = {
  src: string;
  /** Lighter rendition served to screens up to 900px wide. */
  srcMobile?: string;
  poster?: string;
  title: string;
  /** "view": plays muted while on screen. "hover": previews on hover (falls back to view on touch). */
  trigger?: "view" | "hover";
  /** "ambient" has no controls, for videos used as decoration inside links. */
  variant?: "feature" | "short" | "ambient";
  sizes: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Lazy, layout-stable video. Nothing is downloaded until the element nears the
 * viewport; the optimized poster holds the box until the first frame is ready.
 * The parent sets the size (aspect-ratio), so the layout never shifts.
 */
export function SmartVideo({ src, srcMobile, poster, title, trigger = "view", variant = "feature", sizes }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  // True once frames have actually been painted; until then the poster stays on top.
  const [shown, setShown] = useState(false);
  const userPaused = useRef(false);
  const wantPlay = useRef(false);

  const play = () => {
    wantPlay.current = true;
    const v = videoRef.current;
    if (!v || !v.getAttribute("src")) return; // starts once the source attaches (effect below)
    v.play().catch(() => {});
  };
  const pause = () => {
    wantPlay.current = false;
    videoRef.current?.pause();
  };

  // Attach the source shortly before the video scrolls into view.
  useEffect(() => {
    const el = boxRef.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        const small = window.matchMedia("(max-width: 900px)").matches;
        setSource(small && srcMobile ? srcMobile : src);
        io.disconnect();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src, srcMobile]);

  useEffect(() => {
    if (source && wantPlay.current) videoRef.current?.play().catch(() => {});
  }, [source]);

  // Autoplay (muted) while visible, unless the user paused it.
  useEffect(() => {
    const touch = window.matchMedia("(hover: none)").matches;
    if (trigger === "hover" && !touch) return;
    const el = boxRef.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.55 && !userPaused.current) play();
        else if (e.intersectionRatio < 0.55) pause();
      },
      { threshold: [0, 0.55] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trigger]);

  const onEnter = () => {
    if (trigger === "hover" && !userPaused.current) play();
  };
  const onLeave = () => {
    if (trigger === "hover" && (muted || variant === "ambient")) pause();
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (playing) {
      userPaused.current = true;
      pause();
    } else {
      userPaused.current = false;
      if (v && variant === "feature") {
        v.muted = false;
        setMuted(false);
      }
      play();
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) {
      userPaused.current = false;
      play();
    }
  };

  const fullscreen = () => {
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
    else v.webkitEnterFullscreen?.();
  };

  const isFeature = variant === "feature";

  return (
    <div
      ref={boxRef}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="group/video absolute inset-0 overflow-hidden rounded-[inherit] bg-surface"
    >
      {poster && (
        <Image
          src={poster}
          alt=""
          fill
          sizes={sizes}
          quality={90}
          className={`object-cover transition-[opacity,transform] duration-[1200ms] ease-[var(--ease-lux)] group-hover/video:scale-[1.02] ${
            shown && playing ? "opacity-0" : "opacity-100"
          }`}
        />
      )}
      <video
        ref={videoRef}
        src={source ?? undefined}
        muted={muted}
        loop
        playsInline
        preload="none"
        disablePictureInPicture={!isFeature}
        onPlay={() => setPlaying(true)}
        onPlaying={() => setShown(true)}
        onPause={() => setPlaying(false)}
        className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${shown ? "opacity-100" : "opacity-0"}`}
        aria-label={title}
      />

      {/* soft vignette for legibility of the overlay controls */}
      {variant !== "ambient" && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10" />
      )}

      {variant !== "ambient" && (
        <>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? `Jeda ${title}` : `Putar ${title}`}
            className="absolute inset-0 z-[1] cursor-pointer"
          >
            <AnimatePresence>
              {!playing && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.15 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  {isFeature ? (
                    <span className="grid size-16 place-items-center rounded-full bg-white/90 text-black transition-transform duration-500 group-hover/video:scale-105 md:size-[84px]">
                      <PlayIcon size={30} className="translate-x-0.5" />
                    </span>
                  ) : (
                    <span className="grid size-[56px] place-items-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur-sm transition-transform duration-500 group-hover/video:scale-105">
                      <PlayIcon size={22} className="translate-x-0.5" />
                    </span>
                  )}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-3 ${isFeature ? "p-4 md:p-6" : "p-4"}`}
          >
            <span className={`font-medium text-white/90 drop-shadow ${isFeature ? "text-xs md:text-sm" : "text-[13px]"}`}>
              {title}
            </span>
            <div className="pointer-events-auto flex gap-2">
              {isFeature && playing && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Jeda video"
                  className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:border-white/50 hover:bg-black/45"
                >
                  <PauseIcon size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Nyalakan suara" : "Matikan suara"}
                className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:border-white/50 hover:bg-black/45"
              >
                {muted ? <MuteIcon size={16} /> : <VolumeIcon size={16} />}
              </button>
              {isFeature && (
                <button
                  type="button"
                  onClick={fullscreen}
                  aria-label="Layar penuh"
                  className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:border-white/50 hover:bg-black/45"
                >
                  <ExpandIcon size={16} />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
