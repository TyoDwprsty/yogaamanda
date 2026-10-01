"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useTransition } from "react";
import { saveSection, type SaveResult } from "@/app/admin/actions";
import type { SectionKey, SiteContent } from "@/lib/content/schema";

/** Local draft of one content section, with dirty tracking and save-to-server. */
export function useSectionEditor<K extends SectionKey>(key: K, initial: SiteContent[K]) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const save = () =>
    start(async () => {
      const res = await saveSection(key, draft);
      setResult(res);
      if (res.ok) setSaved(draft);
    });

  const reset = () => {
    setDraft(saved);
    setResult(null);
  };

  /** Error message for a field path like "items.2.title". */
  const issue = (path: string) => (result && !result.ok ? result.issues?.find((i) => i.path === path)?.message : undefined);

  return { draft, setDraft, dirty, pending, save, reset, result, issue };
}

export function SaveBar({
  dirty,
  pending,
  result,
  onSave,
  onReset,
}: {
  dirty: boolean;
  pending: boolean;
  result: SaveResult | null;
  onSave: () => void;
  onReset: () => void;
}) {
  const status = pending
    ? "Menyimpan…"
    : result && !result.ok
      ? result.error
      : result?.ok && !dirty
        ? "Tersimpan. Website sudah diperbarui."
        : dirty
          ? "Ada perubahan yang belum disimpan."
          : "Semua perubahan tersimpan.";

  return (
    <div className="sticky bottom-4 z-30 mt-8">
      <div className="mx-auto flex max-w-3xl flex-col items-stretch justify-between gap-3 rounded-full border border-line-strong bg-[var(--nav-bg)] py-2 pr-2 pl-5 shadow-[0_20px_60px_-20px_var(--shadow)] backdrop-blur-xl max-sm:rounded-3xl max-sm:p-3 sm:flex-row sm:items-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={status}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            role="status"
            className={`text-[13px] font-medium ${result && !result.ok && !pending ? "text-[#e5866b]" : dirty ? "text-gold-text" : "text-muted"}`}
          >
            {status}
          </motion.span>
        </AnimatePresence>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={!dirty || pending}
            className="btn-ghost h-11 flex-1 cursor-pointer rounded-full px-5 text-sm font-semibold text-muted disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            Batalkan
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || pending}
            className="btn-gold h-11 flex-1 cursor-pointer rounded-full px-6 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            Simpan perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
