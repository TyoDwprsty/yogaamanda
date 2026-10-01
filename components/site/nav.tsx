"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { Magnetic } from "@/components/fx/magnetic";
import { ThemeToggle } from "./theme-toggle";

const LINKS = [
  { href: "#video", label: "Video", long: "Video" },
  { href: "#content", label: "Content", long: "Content Media" },
  { href: "#tools", label: "Tools", long: "Tools" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function Nav({ name, email, handle }: { name: string; email: string; handle: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  // Highlight the section currently in the middle of the viewport.
  useEffect(() => {
    const ids = [...LINKS.map((l) => l.href.slice(1)), "contact"];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const pill = hovered ?? active;

  return (
    <>
      <motion.nav
        aria-label="Navigasi utama"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 0.1 }}
        className={`fixed top-3.5 left-1/2 z-50 flex h-14 w-[calc(100%-32px)] max-w-[840px] -translate-x-1/2 items-center justify-between rounded-full border bg-[var(--nav-bg)] pr-1.5 pl-5 backdrop-blur-xl transition-[box-shadow,border-color] duration-700 md:top-7 md:h-[60px] md:pr-2 md:pl-6 ${
          scrolled ? "border-line-strong shadow-[0_18px_50px_-20px_var(--shadow)]" : "border-line"
        }`}
      >
        <a href="#top" className="text-[15px] font-extrabold tracking-[-0.02em] text-ink md:text-base">
          {name}
        </a>

        <div className="hidden items-center gap-1 md:flex" onPointerLeave={() => setHovered(null)}>
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onPointerEnter={() => setHovered(l.href)}
              className={`relative rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors duration-500 ${
                pill === l.href ? "text-ink" : "text-muted"
              }`}
            >
              {pill === l.href && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-0 rounded-full border border-line bg-surface-2"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{l.label}</span>
            </a>
          ))}
          <div className="ml-3 flex items-center gap-1.5">
            <ThemeToggle />
            <Magnetic>
              <a href="#contact" className="btn-gold btn-cta inline-flex h-11 items-center rounded-full px-[22px] text-[15px] font-semibold">
                Contact
              </a>
            </Magnetic>
          </div>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle className="border-transparent" />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="m-menu"
            className="btn-ghost grid size-11 cursor-pointer place-items-center rounded-full text-ink"
          >
            {open ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="m-menu"
            initial={{ opacity: 0, y: -12, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed top-20 left-4 z-50 flex w-[calc(100%-32px)] origin-top flex-col rounded-3xl border border-line bg-surface p-2.5 shadow-[0_30px_80px_-30px_var(--shadow)] md:hidden"
          >
            {[...LINKS, { href: "#contact", label: "Contact", long: "Contact" }].map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: EASE }}
                className="flex min-h-14 items-center rounded-2xl px-4 text-xl font-bold text-ink active:bg-surface-2"
              >
                {l.long}
              </motion.a>
            ))}
            <div className="mx-1.5 mt-2 mb-1.5 flex items-center justify-between border-t border-line pt-3.5 text-[13px] font-medium text-muted">
              <span>{handle}</span>
              {email && (
                <a href={`mailto:${email}`} className="inline-flex min-h-11 items-center font-semibold text-gold-text">
                  Kirim email
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
