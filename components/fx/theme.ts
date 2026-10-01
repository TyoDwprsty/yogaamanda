"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "./theme-key";

export type Theme = "dark" | "light";

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

function read(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => "dark");
}

let switching = false;

/**
 * Switches theme with a feathered circular reveal that grows from `origin`
 * (usually the toggle button). Falls back to a color cross-fade.
 */
export function switchTheme(origin?: { x: number; y: number }) {
  if (switching) return;
  const root = document.documentElement;
  const next: Theme = read() === "dark" ? "light" : "dark";

  const apply = () => {
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canTransition = typeof document.startViewTransition === "function";

  if (reduced || !canTransition) {
    root.classList.add("theme-fade");
    apply();
    window.setTimeout(() => root.classList.remove("theme-fade"), 750);
    return;
  }

  switching = true;
  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  // The mask is a feathered circle; it must end large enough to cover the far corner.
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) * 1.45;

  root.classList.add("theme-switching");
  const t = document.startViewTransition(apply);
  t.ready
    .then(() => {
      root.animate(
        {
          maskSize: ["0px 0px", `${r * 2}px ${r * 2}px`],
          maskPosition: [`${x}px ${y}px`, `${x - r}px ${y - r}px`],
        },
        {
          duration: 1100,
          easing: "cubic-bezier(0.65, 0, 0.25, 1)",
          // Hold the last frame until the transition tears down; otherwise the mask snaps
          // back to its CSS default and the corners show the old theme for a frame.
          fill: "both",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});
  t.finished.finally(() => {
    root.classList.remove("theme-switching");
    switching = false;
  });
}
