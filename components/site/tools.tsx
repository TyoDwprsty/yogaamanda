"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { Reveal } from "@/components/fx/reveal";
import { ImageIcon } from "@/components/icons";
import type { SiteContent, ToolTab } from "@/lib/content/schema";
import { container } from "./section";

const EASE = [0.22, 1, 0.36, 1] as const;

function Photo({ tab }: { tab: ToolTab }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={tab.id}
        initial={{ opacity: 0, scale: 1.06, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="absolute inset-0"
      >
        {tab.photo ? (
          <Image src={tab.photo} alt={tab.label} fill quality={90} sizes="(min-width: 1080px) 680px, 100vw" className="object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2.5 bg-surface-2 text-muted">
            <ImageIcon size={34} />
            <span className="text-[13px] font-medium">Foto: {tab.label}</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export function Tools({ tools }: { tools: SiteContent["tools"] }) {
  const [cur, setCur] = useState(tools.tabs[0]?.id);
  const sel = tools.tabs.find((t) => t.id === cur) ?? tools.tabs[0];

  return (
    <section id="tools" aria-labelledby="tools-title" className="relative z-10 py-20 md:py-32">
      <Reveal className={`${container} flex flex-col gap-2.5 md:gap-3`}>
        <h2 id="tools-title" className="text-[38px] leading-[1.05] font-extrabold tracking-[-0.035em] text-ink md:text-[56px]">
          {tools.heading}
        </h2>
        {tools.description && <p className="max-w-[520px] text-[15px] leading-[1.6] text-muted md:text-[17px]">{tools.description}</p>}
      </Reveal>

      {sel && (
        // Mobile stacks tabs → photo → list; desktop puts tabs over the list and the photo beside both.
        // The block has a fixed height so a long list scrolls instead of stretching the photo.
        <Reveal
          delay={0.1}
          className={`${container} mt-8 grid grid-cols-1 gap-4 md:mt-10 md:h-[580px] md:grid-cols-[340px_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)] md:gap-x-8 md:gap-y-3`}
        >
          <div
            role="tablist"
            aria-label={tools.heading}
            className="grid gap-2 md:col-start-1 md:row-start-1"
            style={{ gridTemplateColumns: `repeat(${tools.tabs.length}, minmax(0, 1fr))` }}
          >
            {tools.tabs.map((t) => {
              const on = t.id === sel.id;
              return (
                <button
                  key={t.id}
                  id={`tools-tab-${t.id}`}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="tools-panel"
                  onClick={() => setCur(t.id)}
                  className={`relative h-12 cursor-pointer rounded-2xl border text-[15px] font-semibold transition-colors duration-500 md:h-14 md:text-base ${
                    on ? "border-transparent text-on-gold" : "border-line bg-surface text-ink hover:border-line-strong"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="tools-tab"
                      className="btn-gold absolute inset-0 rounded-2xl"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative h-[300px] overflow-hidden rounded-[22px] border border-line bg-surface md:col-start-2 md:row-span-2 md:row-start-1 md:h-auto md:rounded-[24px]">
            <Photo tab={sel} />
          </div>

          <div
            id="tools-panel"
            role="tabpanel"
            aria-labelledby={`tools-tab-${sel.id}`}
            className="flex max-h-[380px] min-h-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface md:col-start-1 md:row-start-2 md:max-h-none"
          >
            <div data-lenis-prevent className="scroll-thin min-h-0 flex-1 overflow-y-auto p-2 md:p-2.5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.ol
                  key={sel.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex flex-col gap-0.5"
                >
                  {sel.items.map((row, i) => (
                    <li
                      key={row.id}
                      className="group/row grid grid-cols-[28px_minmax(0,1fr)] items-baseline gap-3 rounded-2xl border border-transparent px-4 py-3.5 transition-[background-color,border-color,transform] duration-500 ease-[var(--ease-lux)] hover:translate-x-1 hover:border-line hover:bg-surface-2"
                    >
                      <span className="text-[13px] font-semibold text-muted tabular-nums transition-colors duration-500 group-hover/row:text-gold-text">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex flex-col gap-0.5">
                        {row.label && <span className="text-[17px] font-bold text-ink">{row.label}</span>}
                        {row.value && <span className="text-[13.5px] font-medium text-muted">{row.value}</span>}
                      </span>
                    </li>
                  ))}
                  {sel.items.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">Daftar masih kosong.</li>}
                </motion.ol>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );
}
