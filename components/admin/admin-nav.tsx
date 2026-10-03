"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { GoldText } from "@/components/fx/gold-text";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { ArrowUpRightIcon } from "@/components/icons";

const ITEMS = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/profil", label: "Profil" },
  { href: "/admin/bukti", label: "Pengikut & pembicara" },
  { href: "/admin/video", label: "Video" },
  { href: "/admin/konten", label: "Content Media" },
  { href: "/admin/tools", label: "Alat & studio" },
  { href: "/admin/kontak", label: "Kontak" },
  { href: "/admin/footer", label: "Footer" },
  { href: "/admin/pesan", label: "Pesan masuk" },
] as const;

export function AdminNav({ user, unread }: { user: string; unread: number }) {
  const path = usePathname();

  return (
    <aside className="flex flex-col gap-4 md:sticky md:top-10 md:h-[calc(100dvh-80px)]">
      <div className="flex items-center justify-between gap-3 rounded-3xl border border-line bg-surface px-5 py-4">
        <div>
          <div className="text-[17px] font-extrabold tracking-[-0.02em] text-ink">Yoga Amanda</div>
          <div className="font-serif text-[15px] italic">
            <GoldText>Admin panel</GoldText>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <nav
        aria-label="Menu admin"
        className="scroll-none flex gap-1 overflow-x-auto rounded-3xl border border-line bg-surface p-2 md:flex-col md:overflow-visible"
      >
        {ITEMS.map((item) => {
          const active = item.href === "/admin" ? path === "/admin" : path.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex h-11 shrink-0 items-center justify-between gap-3 rounded-2xl px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-500 ${
                active ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-nav"
                  className="absolute inset-0 rounded-2xl border border-[color-mix(in_oklab,var(--gold)_45%,transparent)] bg-tint shadow-[0_0_24px_-10px_var(--glow-strong)]"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              )}
              <span className="relative">{item.label}</span>
              {item.href === "/admin/pesan" && unread > 0 && (
                <span className="btn-gold relative grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 rounded-3xl border border-line bg-surface p-2 max-md:flex-row">
        <a
          href="/"
          target="_blank"
          className="flex h-11 flex-1 items-center justify-between rounded-2xl px-4 text-sm font-semibold text-muted transition-colors hover:text-gold-text"
        >
          Lihat website <ArrowUpRightIcon size={16} />
        </a>
        <form action={logout} className="flex-1">
          <button
            type="submit"
            className="flex h-11 w-full cursor-pointer items-center justify-between rounded-2xl px-4 text-sm font-semibold text-muted transition-colors hover:text-[#e5866b]"
          >
            Keluar <span className="max-w-24 truncate text-xs font-medium">{user}</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
