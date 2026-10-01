"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function newId() {
  return crypto.randomUUID().slice(0, 8);
}

/** Generic CRUD list: add, remove, reorder. Each row renders its own fields. */
export function ListEditor<T extends { id: string }>({
  items,
  onChange,
  create,
  renderItem,
  itemLabel,
  max,
  addLabel = "Tambah",
}: {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  itemLabel: (item: T, index: number) => string;
  max?: number;
  addLabel?: string;
}) {
  const update = (i: number, patch: Partial<T>) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="rounded-2xl border border-line bg-bg/60 p-4 md:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="truncate text-sm font-bold text-ink">
                <span className="mr-2 text-gold-text">{String(i + 1).padStart(2, "0")}</span>
                {itemLabel(item, i)}
              </span>
              <div className="flex shrink-0 gap-1">
                <IconBtn label="Naikkan" onClick={() => move(i, -1)} disabled={i === 0}>
                  ↑
                </IconBtn>
                <IconBtn label="Turunkan" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
                  ↓
                </IconBtn>
                <IconBtn
                  label="Hapus"
                  danger
                  onClick={() => {
                    if (confirm(`Hapus "${itemLabel(item, i)}"?`)) remove(i);
                  }}
                >
                  ✕
                </IconBtn>
              </div>
            </div>
            <div className="flex flex-col gap-4">{renderItem(item, (p) => update(i, p), i)}</div>
          </motion.div>
        ))}
      </AnimatePresence>
      {items.length === 0 && <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">Belum ada item.</p>}
      <button
        type="button"
        onClick={() => onChange([...items, create()])}
        disabled={max !== undefined && items.length >= max}
        className="btn-ghost h-11 cursor-pointer rounded-full border-dashed text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        + {addLabel}
        {max !== undefined && <span className="ml-1 text-muted">({items.length}/{max})</span>}
      </button>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`btn-ghost grid size-8 cursor-pointer place-items-center rounded-full text-xs font-bold disabled:cursor-not-allowed disabled:opacity-30 ${
        danger ? "text-[#e5866b] hover:!border-[#e5866b] hover:!text-[#e5866b]" : "text-muted"
      }`}
    >
      {children}
    </button>
  );
}
