"use client";

import { AnimatePresence, motion } from "motion/react";
import type { MouseEvent } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";
import { switchTheme, useTheme } from "@/components/fx/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const isDark = theme === "dark";

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    switchTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isDark ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
      className={`btn-ghost relative grid size-11 cursor-pointer place-items-center overflow-hidden rounded-full text-ink ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.4 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid place-items-center"
        >
          {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
