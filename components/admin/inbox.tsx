"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";
import { deleteMessage, markAllRead, setMessageRead } from "@/app/admin/actions";
import { MailIcon, PhoneIcon } from "@/components/icons";
import type { Message } from "@/lib/content/schema";

const EASE = [0.22, 1, 0.36, 1] as const;

const dateFmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

export function Inbox({ messages }: { messages: Message[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [pending, start] = useTransition();
  const list = filter === "unread" ? messages.filter((m) => !m.read) : messages;
  const unread = messages.filter((m) => !m.read).length;

  const toggle = (m: Message) => {
    setOpen(open === m.id ? null : m.id);
    if (!m.read) start(() => setMessageRead(m.id, true));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-1 rounded-full border border-line bg-surface p-1">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`h-9 cursor-pointer rounded-full px-4 text-[13px] font-semibold transition-all duration-500 ${
                filter === f ? "btn-gold" : "text-muted hover:text-ink"
              }`}
            >
              {f === "all" ? `Semua (${messages.length})` : `Belum dibaca (${unread})`}
            </button>
          ))}
        </div>
        {unread > 0 && (
          <button
            type="button"
            disabled={pending}
            onClick={() => start(() => markAllRead())}
            className="btn-ghost h-10 cursor-pointer rounded-full px-4 text-[13px] font-semibold text-muted"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>

      {list.length === 0 && (
        <div className="rounded-3xl border border-dashed border-line p-10 text-center text-sm text-muted">Belum ada pesan.</div>
      )}

      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {list.map((m) => {
            const isOpen = open === m.id;
            return (
              <motion.li
                key={m.id}
                layout
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: EASE }}
                className={`overflow-hidden rounded-3xl border bg-surface transition-[border-color,box-shadow] duration-500 ${
                  isOpen ? "border-[color-mix(in_oklab,var(--gold)_45%,transparent)] shadow-[0_0_40px_-18px_var(--glow-strong)]" : "border-line"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(m)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left"
                >
                  <span
                    aria-label={m.read ? "Sudah dibaca" : "Belum dibaca"}
                    className={`size-2 shrink-0 rounded-full ${m.read ? "bg-line-strong" : "bg-gold shadow-[0_0_10px_2px_var(--glow-strong)]"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={`truncate text-[15px] ${m.read ? "font-semibold text-ink" : "font-extrabold text-ink"}`}>{m.name}</span>
                      <span className="shrink-0 text-xs text-muted">{dateFmt.format(new Date(m.createdAt))}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[13.5px] text-muted">{m.note}</span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      <div className="border-t border-line px-5 py-5">
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-ink">{m.note}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <a
                            href={`mailto:${m.email}?subject=${encodeURIComponent("Re: pesan dari website")}`}
                            className="btn-gold inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold"
                          >
                            <MailIcon size={15} /> {m.email}
                          </a>
                          {m.phone && (
                            <a
                              href={`https://wa.me/${m.phone.replace(/[^\d]/g, "").replace(/^0/, "62")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-ghost inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-ink"
                            >
                              <PhoneIcon size={15} /> {m.phone}
                            </a>
                          )}
                          <span className="flex-1" />
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => start(() => setMessageRead(m.id, !m.read))}
                            className="btn-ghost h-10 cursor-pointer rounded-full px-4 text-[13px] font-semibold text-muted"
                          >
                            {m.read ? "Tandai belum dibaca" : "Tandai dibaca"}
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => {
                              if (confirm(`Hapus pesan dari ${m.name}?`)) start(() => deleteMessage(m.id));
                            }}
                            className="btn-ghost h-10 cursor-pointer rounded-full px-4 text-[13px] font-semibold text-[#e5866b] hover:!border-[#e5866b] hover:!text-[#e5866b]"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
