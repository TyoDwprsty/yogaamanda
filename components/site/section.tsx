import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons";

export const container = "relative z-10 mx-auto w-[min(1040px,calc(100%-40px))]";

export function GoldLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group/link inline-flex min-h-11 items-center gap-1.5 font-semibold text-gold-text ${className}`}
    >
      <span className="underline decoration-[color-mix(in_oklab,var(--gold)_40%,transparent)] decoration-1 underline-offset-[5px] transition-[text-decoration-color] duration-500 group-hover/link:decoration-current">
        {children}
      </span>
      <ArrowUpRightIcon
        size={16}
        className="transition-transform duration-500 ease-[var(--ease-lux)] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
      />
    </a>
  );
}
