"use client";

import { useId, type ReactNode } from "react";

export const inputClass =
  "w-full rounded-[14px] border border-line bg-bg px-4 text-[15px] font-medium text-ink placeholder:text-muted/70 outline-none transition-[border-color,box-shadow] duration-500 hover:border-line-strong focus:border-gold focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--gold)_14%,transparent),0_0_28px_-8px_var(--glow-strong)]";

export function Field({ label, hint, error, children, id }: { label: string; hint?: string; error?: string; children: ReactNode; id?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-[12.5px] font-medium text-[#e5866b]">{error}</span>
      ) : (
        hint && <span className="text-[12.5px] text-muted">{hint}</span>
      )}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  type?: string;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} id={id}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`${inputClass} h-12`}
      />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} id={id}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        data-lenis-prevent
        aria-invalid={!!error}
        className={`${inputClass} scroll-thin resize-y py-3 leading-[1.55]`}
      />
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const id = useId();
  return (
    <Field label={label} id={id}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={`${inputClass} h-12 cursor-pointer`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      <div role="radiogroup" aria-label={label} className="inline-flex w-fit gap-1 rounded-full border border-line bg-bg p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`h-9 cursor-pointer rounded-full px-4 text-[13px] font-semibold transition-all duration-500 ${
              value === o.value ? "btn-gold" : "text-muted hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Card({ title, description, children, actions }: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 md:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-[-0.01em] text-ink">{title}</h2>
          {description && <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** Whole numbers; accepts "12.500" or "12,500" and keeps only the digits. */
export function NumberField({
  label,
  value,
  onChange,
  hint,
  error,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} id={id}>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value ? String(value) : ""}
        placeholder="0"
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "").slice(0, 11)) || 0)}
        aria-invalid={!!error}
        className={`${inputClass} h-12 tabular-nums disabled:opacity-50`}
      />
    </Field>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-[13px] font-semibold text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-6 w-10 rounded-full border border-line-strong bg-bg transition-colors duration-300 peer-checked:border-gold peer-checked:bg-gold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold after:absolute after:top-0.5 after:left-0.5 after:size-[18px] after:rounded-full after:bg-muted after:transition-transform after:duration-300 peer-checked:after:translate-x-4 peer-checked:after:bg-on-gold"
      />
      {label}
    </label>
  );
}
