import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { countUnread } from "@/lib/messages";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "Admin — Yoga Amanda",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();
  const unread = await countUnread();

  return (
    <div className="relative isolate min-h-dvh">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-200px] left-1/2 -z-10 h-[700px] w-[1100px] max-w-[180vw] -translate-x-1/2 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,var(--glow)_0%,transparent_72%)]"
      />
      <div className="mx-auto grid w-[min(1200px,calc(100%-32px))] gap-6 py-6 md:grid-cols-[240px_minmax(0,1fr)] md:gap-10 md:py-10">
        <AdminNav user={session.sub} unread={unread} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
