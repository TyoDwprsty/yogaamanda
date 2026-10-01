"use client";

import Lenis from "lenis";
import { useEffect, useSyncExternalStore } from "react";

let instance: Lenis | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function getLenis() {
  return instance;
}

export function useLenis() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => instance,
    () => null,
  );
}

/** Scrolls smoothly when Lenis runs, natively otherwise. */
export function scrollToY(y: number, immediate = false) {
  if (instance) instance.scrollTo(y, { immediate, duration: immediate ? 0 : 1.2 });
  else window.scrollTo({ top: y, behavior: immediate ? "instant" : "smooth" });
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.085,
      autoRaf: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      // In-page links (#video, #contact, ...) glide instead of jumping.
      anchors: { offset: -96, duration: 1.4 },
    });
    instance = lenis;
    emit();

    return () => {
      lenis.destroy();
      instance = null;
      emit();
    };
  }, []);

  return null;
}
