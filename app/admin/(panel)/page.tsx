import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { ArrowUpRightIcon } from "@/components/icons";
import { getContent } from "@/lib/content/store";
import { listMessages } from "@/lib/messages";

export default async function AdminHome() {
  const [content, messages] = await Promise.all([getContent(), listMessages()]);
  const unread = messages.filter((m) => !m.read).length;

  const stats = [
    { label: "Short video", value: content.video.shorts.length, href: "/admin/video" },
    { label: "Kanal konten", value: content.contentMedia.items.length, href: "/admin/konten" },
    { label: "Baris alat & studio", value: content.tools.tabs.reduce((n, t) => n + t.items.length, 0), href: "/admin/tools" },
    { label: "Pesan belum dibaca", value: unread, href: "/admin/pesan" },
  ];

  // Listed in page order. The quoted text is what the section currently says on the site.
  const { profile, proof, video, contentMedia, tools, contact } = content;
  const sections = [
    { href: "/admin/profil", title: "Profil", text: `Paling atas: “${profile.tagline || profile.name}”, foto, media sosial` },
    { href: "/admin/bukti", title: "Pengikut & pembicara", text: `Angka pengikut dan “${proof.eventsHeading}”` },
    { href: "/admin/video", title: "Video", text: `“${video.main.title || video.heading}”, video utama dan short` },
    { href: "/admin/konten", title: "Content Media", text: `“${contentMedia.heading}”: kanal, foto/GIF/video` },
    { href: "/admin/tools", title: "Alat & studio", text: `“${tools.heading}”: ${tools.tabs.map((t) => t.label).join(", ")}` },
    { href: "/admin/kontak", title: "Kontak", text: `“${contact.heading}”: email, telepon, teks` },
    { href: "/admin/footer", title: "Footer", text: "Paling bawah: nama, ikon sosial, hak cipta" },
    { href: "/admin/pesan", title: "Pesan masuk", text: `Pesan dari form “${contact.heading}”` },
  ];

  return (
    <>
      <PageHeader title={`Halo, ${content.profile.name.split(" ")[0]}`} description="Semua perubahan langsung tampil di website setelah disimpan." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-3xl border border-line bg-surface p-5 transition-[border-color,box-shadow] duration-500 hover:border-[color-mix(in_oklab,var(--gold)_55%,transparent)] hover:shadow-[0_0_40px_-16px_var(--glow-strong)]"
          >
            <div className="text-[34px] leading-none font-extrabold tracking-[-0.03em] text-ink group-hover:text-gold-text">{s.value}</div>
            <div className="mt-2 text-[13px] font-medium text-muted">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex items-center justify-between gap-4 rounded-3xl border border-line bg-surface px-6 py-5 transition-[border-color,box-shadow] duration-500 hover:border-[color-mix(in_oklab,var(--gold)_55%,transparent)] hover:shadow-[0_0_40px_-16px_var(--glow-strong)]"
          >
            <div>
              <div className="text-base font-bold text-ink">{s.title}</div>
              <div className="mt-0.5 text-[13.5px] text-muted">{s.text}</div>
            </div>
            <span className="btn-ghost grid size-10 shrink-0 place-items-center rounded-full text-muted group-hover:border-gold group-hover:text-gold-text">
              <ArrowUpRightIcon size={16} />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
