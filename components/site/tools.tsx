"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { Reveal } from "@/components/fx/reveal";
import { ImageIcon } from "@/components/icons";
import type { SiteContent, Tool } from "@/lib/content/schema";
import { container } from "./section";

const EASE = [0.22, 1, 0.36, 1] as const;

function Photo({ tool }: { tool: Tool }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={tool.id}
        initial={{ opacity: 0, scale: 1.06, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="absolute inset-0"
      >
        {tool.photo ? (
          <Image src={tool.photo} alt={tool.name} fill quality={90} sizes="(min-width: 768px) 670px, 100vw" className="object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2.5 bg-surface-2 text-muted">
            <ImageIcon size={34} />
            <span className="text-[13px] font-medium">Foto: {tool.name}</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function Info({ tool, compact }: { tool: Tool; compact?: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={tool.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.45, ease: EASE }}
        className={compact ? "flex flex-col gap-1.5" : "flex w-full items-end justify-between gap-6"}
      >
        <div className="flex flex-col gap-1.5">
          <span className={`font-extrabold tracking-[-0.025em] text-ink ${compact ? "text-2xl" : "text-[30px]"}`}>{tool.name}</span>
          <span className={`font-medium text-muted ${compact ? "text-sm" : "text-[15px]"}`}>{tool.product}</span>
        </div>
        {tool.description && (
          <span className={`text-sm leading-[1.55] text-muted ${compact ? "mt-1" : "max-w-[300px] text-right"}`}>{tool.description}</span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export function Tools({ tools }: { tools: SiteContent["tools"] }) {
  const [cur, setCur] = useState(tools.items[0]?.id);
  const sel = tools.items.find((t) => t.id === cur) ?? tools.items[0];

  return (
    <section id="tools" aria-labelledby="tools-title" className="relative z-10 py-20 md:py-32">
      <Reveal className={`${container} flex flex-col gap-2.5 md:gap-3`}>
        <h2 id="tools-title" className="text-[38px] leading-[1.05] font-extrabold tracking-[-0.035em] text-ink md:text-[56px]">
          {tools.heading}
        </h2>
        {tools.description && <p className="max-w-[520px] text-[15px] leading-[1.6] text-muted md:text-[17px]">{tools.description}</p>}
      </Reveal>

      {sel && (
        <>
          {/* Desktop: list + photo */}
          <Reveal delay={0.1} className={`${container} mt-10 hidden grid-cols-[340px_minmax(0,1fr)] gap-8 md:grid`}>
            <div
              data-lenis-prevent
              role="tablist"
              aria-label="Daftar alat"
              aria-orientation="vertical"
              className="scroll-thin flex h-[520px] flex-col gap-1 overflow-y-auto rounded-3xl border border-line bg-surface p-2.5"
            >
              {tools.items.map((t) => {
                const on = t.id === sel.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setCur(t.id)}
                    className="group/row relative flex min-h-[76px] shrink-0 cursor-pointer items-center justify-between gap-3 rounded-2xl px-[18px] py-3.5 text-left"
                  >
                    {on && (
                      <motion.span
                        layoutId="tool-active"
                        className="absolute inset-0 rounded-2xl border border-line-strong bg-surface-2"
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                      />
                    )}
                    {!on && (
                      <span className="absolute inset-0 rounded-2xl border border-transparent transition-colors duration-500 group-hover/row:border-line" />
                    )}
                    <span className="relative flex flex-col gap-1">
                      <span className="text-lg font-bold text-ink">{t.name}</span>
                      <span className="text-[13px] font-medium text-muted">{t.product}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`relative size-2 shrink-0 rounded-full transition-all duration-500 ${on ? "bg-gold" : "bg-transparent"}`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="relative h-[520px] overflow-hidden rounded-[24px] border border-line bg-surface">
              <div className="absolute inset-0">
                <Photo tool={sel} />
                <div className="absolute inset-x-0 bottom-0 flex min-h-[124px] items-end border-t border-line bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] px-8 py-7 backdrop-blur-xl">
                  <Info tool={sel} />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Mobile: chips + card */}
          <div className="mt-6 md:hidden">
            <div role="tablist" aria-label="Daftar alat" className="scroll-none flex scroll-px-5 gap-2 overflow-x-auto px-5 pb-1">
              {tools.items.map((t) => {
                const on = t.id === sel.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setCur(t.id)}
                    className={`relative h-11 shrink-0 cursor-pointer rounded-full border px-[18px] text-sm font-semibold whitespace-nowrap transition-colors duration-500 ${
                      on ? "border-transparent text-on-gold" : "border-line text-ink"
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="tool-chip"
                        className="btn-gold absolute inset-0 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative">{t.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="mx-5 mt-4 overflow-hidden rounded-[22px] border border-line bg-surface">
              <div className="relative h-[300px] overflow-hidden">
                <Photo tool={sel} />
              </div>
              <div className="min-h-[132px] border-t border-line bg-bg p-5">
                <Info tool={sel} compact />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
