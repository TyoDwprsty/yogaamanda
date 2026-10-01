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
    { label: "Alat", value: content.tools.items.length, href: "/admin/tools" },
    { label: "Pesan belum dibaca", value: unread, href: "/admin/pesan" },
  ];

  const sections = [
    { href: "/admin/profil", title: "Profil", text: "Foto, nama, tagline, bio, media sosial" },
    { href: "/admin/bukti", title: "Bukti & pengikut", text: "Jumlah pengikut, brand kolaborasi, event pembicara" },
    { href: "/admin/video", title: "Video", text: "Video utama dan short video 9:16" },
    { href: "/admin/konten", title: "Content Media", text: "Kanal, foto/GIF/video, deskripsi" },
    { href: "/admin/tools", title: "Tools", text: "My daily driver beserta fotonya" },
    { href: "/admin/kontak", title: "Kontak", text: "Email, telepon, teks ajakan" },
    { href: "/admin/pesan", title: "Pesan masuk", text: "Pesan dari form kontak website" },
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
