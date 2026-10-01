"use client";

import {
  SOCIAL_PLATFORMS,
  type MediaItem,
  type Short,
  type SiteContent,
  type Social,
  type SocialPlatform,
  type Tool,
} from "@/lib/content/schema";
import { Card, Segmented, SelectField, TextArea, TextField } from "./fields";
import { ListEditor, newId } from "./list-editor";
import { MediaField } from "./media-field";
import { SaveBar, useSectionEditor } from "./use-section-editor";

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X / Twitter",
  facebook: "Facebook",
  spotify: "Spotify",
  linkedin: "LinkedIn",
  website: "Website",
};

// ───────────── Profil ─────────────

export function ProfileEditor({ initial }: { initial: SiteContent["profile"] }) {
  const ed = useSectionEditor("profile", initial);
  const { draft: d, setDraft } = ed;
  const set = (patch: Partial<typeof d>) => setDraft({ ...d, ...patch });

  return (
    <>
      <div className="flex flex-col gap-6">
        <Card title="Identitas" description="Ditampilkan di bagian paling atas website dan di footer.">
          <MediaField
            label="Foto profil"
            kind="image"
            aspect="1/1"
            value={d.avatar}
            onChange={(avatar) => set({ avatar })}
            hint="Persegi, minimal 600×600px. Ditampilkan bulat dengan ring emas."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Nama" value={d.name} onChange={(name) => set({ name })} error={ed.issue("name")} />
            <TextField
              label="Tagline (tulisan emas)"
              value={d.tagline}
              onChange={(tagline) => set({ tagline })}
              hint='Contoh: "Cerita terbaik"'
            />
          </div>
          <TextArea label="Bio singkat" value={d.bio} onChange={(bio) => set({ bio })} rows={4} />
          <TextField label="Catatan di bawah ikon sosial" value={d.handleNote} onChange={(handleNote) => set({ handleNote })} />
        </Card>

        <Card title="Media sosial" description="Ikon bulat di hero dan footer. Urutan di sini = urutan di website.">
          <ListEditor<Social>
            items={d.socials}
            onChange={(socials) => set({ socials })}
            max={12}
            addLabel="Tambah akun"
            create={() => ({ id: newId(), platform: "instagram", label: "", url: "" })}
            itemLabel={(s) => PLATFORM_LABEL[s.platform]}
            renderItem={(s, update, i) => (
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <SelectField
                  label="Platform"
                  value={s.platform}
                  onChange={(platform) => update({ platform })}
                  options={SOCIAL_PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABEL[p] }))}
                />
                <TextField
                  label="URL"
                  value={s.url}
                  onChange={(url) => update({ url })}
                  placeholder="https://"
                  error={ed.issue(`socials.${i}.url`)}
                />
                <div className="md:col-span-2">
                  <TextField
                    label="Label (untuk pembaca layar)"
                    value={s.label}
                    onChange={(label) => update({ label })}
                    placeholder="Instagram @yogaamanda.a"
                  />
                </div>
              </div>
            )}
          />
        </Card>
      </div>
      <SaveBar dirty={ed.dirty} pending={ed.pending} result={ed.result} onSave={ed.save} onReset={ed.reset} />
    </>
  );
}

// ───────────── Video ─────────────

export function VideoEditor({ initial }: { initial: SiteContent["video"] }) {
  const ed = useSectionEditor("video", initial);
  const { draft: d, setDraft } = ed;
  const set = (patch: Partial<typeof d>) => setDraft({ ...d, ...patch });
  const setMain = (patch: Partial<typeof d.main>) => set({ main: { ...d.main, ...patch } });

  return (
    <>
      <div className="flex flex-col gap-6">
        <Card title="Judul bagian">
          <TextField label="Judul" value={d.heading} onChange={(heading) => set({ heading })} />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Teks link" value={d.allLabel} onChange={(allLabel) => set({ allLabel })} />
            <TextField label="URL link" value={d.allUrl} onChange={(allUrl) => set({ allUrl })} error={ed.issue("allUrl")} />
          </div>
        </Card>

        <Card title="Video utama" description="Tampil 16:9 dengan judul dan deskripsi di sampingnya. Video 21:9 tetap bisa dipakai; sisi kiri-kanannya di-crop rapi di tengah.">
          <Segmented
            label="Sumber"
            value={d.main.kind}
            onChange={(kind) => setMain({ kind })}
            options={[
              { value: "file", label: "Upload file" },
              { value: "youtube", label: "YouTube" },
            ]}
          />
          <TextField label="Judul video" value={d.main.title} onChange={(title) => setMain({ title })} />
          <TextArea
            label="Deskripsi singkat (opsional)"
            value={d.main.description}
            onChange={(description) => setMain({ description })}
            rows={3}
            hint="Satu-dua kalimat di samping video: tentang apa, kenapa layak ditonton."
          />
          {d.main.kind === "file" ? (
            <>
              <MediaField
                label="Video (desktop)"
                kind="video"
                aspect="16/9"
                value={d.main.src}
                onChange={(src, poster) => setMain({ src, ...(poster ? { poster } : {}) })}
              />
              <MediaField
                label="Video ringan untuk HP (opsional)"
                kind="video"
                aspect="16/9"
                value={d.main.srcMobile}
                onChange={(srcMobile) => setMain({ srcMobile })}
                hint="Versi resolusi lebih kecil (mis. 1280px) supaya hemat kuota di HP. Kosongkan untuk memakai video desktop."
              />
              <MediaField
                label="Poster / thumbnail"
                kind="image"
                aspect="16/9"
                value={d.main.poster}
                onChange={(poster) => setMain({ poster })}
                hint="Tampil sebelum video diputar. Diisi otomatis saat upload video bila kosong."
              />
            </>
          ) : (
            <TextField
              label="URL YouTube"
              value={d.main.youtubeUrl}
              onChange={(youtubeUrl) => setMain({ youtubeUrl })}
              placeholder="https://www.youtube.com/watch?v=..."
              error={ed.issue("main.youtubeUrl")}
            />
          )}
        </Card>

        <Card title="Short video" description="Kartu vertikal 9:16 di bawah video utama. Maksimal 9.">
          <TextField label="Judul baris short" value={d.shortsHeading} onChange={(shortsHeading) => set({ shortsHeading })} />
          <ListEditor<Short>
            items={d.shorts}
            onChange={(shorts) => set({ shorts })}
            max={9}
            addLabel="Tambah short"
            create={() => ({ id: newId(), title: "", src: "", poster: "" })}
            itemLabel={(s, i) => s.title || `Short video ${i + 1}`}
            renderItem={(s, update) => (
              <>
                <TextField label="Judul" value={s.title} onChange={(title) => update({ title })} />
                <MediaField
                  label="Video"
                  kind="video"
                  aspect="9/16"
                  value={s.src}
                  onChange={(src, poster) => update({ src, ...(poster ? { poster } : {}) })}
                />
                <MediaField label="Poster" kind="image" aspect="9/16" value={s.poster} onChange={(poster) => update({ poster })} />
              </>
            )}
          />
        </Card>
      </div>
      <SaveBar dirty={ed.dirty} pending={ed.pending} result={ed.result} onSave={ed.save} onReset={ed.reset} />
    </>
  );
}

// ───────────── Content Media ─────────────

export function ContentMediaEditor({ initial }: { initial: SiteContent["contentMedia"] }) {
  const ed = useSectionEditor("contentMedia", initial);
  const { draft: d, setDraft } = ed;
  const set = (patch: Partial<typeof d>) => setDraft({ ...d, ...patch });

  return (
    <>
      <div className="flex flex-col gap-6">
        <Card title="Judul bagian">
          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Judul" value={d.heading} onChange={(heading) => set({ heading })} />
            <TextField label="Subjudul" value={d.subheading} onChange={(subheading) => set({ subheading })} />
          </div>
        </Card>
        <Card
          title="Kanal"
          description="Kanal pertama tampil besar sebagai featured (media 4:3), sisanya jadi baris ringkas di sampingnya. Bisa foto, GIF (otomatis jadi WebP animasi yang jauh lebih ringan) atau video."
        >
          <ListEditor<MediaItem>
            items={d.items}
            onChange={(items) => set({ items })}
            max={12}
            addLabel="Tambah kanal"
            create={() => ({ id: newId(), title: "", description: "", kind: "image", src: "", poster: "", link: "" })}
            itemLabel={(m, i) => m.title || `Kanal ${i + 1}`}
            renderItem={(m, update, i) => (
              <>
                <TextField label="Nama kanal" value={m.title} onChange={(title) => update({ title })} error={ed.issue(`items.${i}.title`)} />
                <TextArea label="Deskripsi" value={m.description} onChange={(description) => update({ description })} rows={2} />
                <TextField
                  label="Link (opsional)"
                  value={m.link}
                  onChange={(link) => update({ link })}
                  placeholder="https://"
                  error={ed.issue(`items.${i}.link`)}
                />
                <Segmented
                  label="Jenis media"
                  value={m.kind}
                  onChange={(kind) => update({ kind, src: "", poster: "" })}
                  options={[
                    { value: "image", label: "Foto / GIF" },
                    { value: "video", label: "Video" },
                  ]}
                />
                <MediaField
                  label={m.kind === "image" ? "Foto / GIF" : "Video"}
                  kind={m.kind}
                  aspect="4/3"
                  value={m.src}
                  onChange={(src, poster) => update({ src, ...(poster ? { poster } : {}) })}
                />
                {m.kind === "video" && (
                  <MediaField label="Poster" kind="image" aspect="4/3" value={m.poster} onChange={(poster) => update({ poster })} />
                )}
              </>
            )}
          />
        </Card>
      </div>
      <SaveBar dirty={ed.dirty} pending={ed.pending} result={ed.result} onSave={ed.save} onReset={ed.reset} />
    </>
  );
}

// ───────────── Tools ─────────────

export function ToolsEditor({ initial }: { initial: SiteContent["tools"] }) {
  const ed = useSectionEditor("tools", initial);
  const { draft: d, setDraft } = ed;
  const set = (patch: Partial<typeof d>) => setDraft({ ...d, ...patch });

  return (
    <>
      <div className="flex flex-col gap-6">
        <Card title="Judul bagian">
          <TextField label="Judul" value={d.heading} onChange={(heading) => set({ heading })} />
          <TextArea label="Deskripsi" value={d.description} onChange={(description) => set({ description })} rows={2} />
        </Card>
        <Card title="Daftar alat" description="Foto tampil di panel kanan (desktop) atau di bawah chip (HP).">
          <ListEditor<Tool>
            items={d.items}
            onChange={(items) => set({ items })}
            max={20}
            addLabel="Tambah alat"
            create={() => ({ id: newId(), name: "", product: "", description: "", photo: "" })}
            itemLabel={(t, i) => t.name || `Alat ${i + 1}`}
            renderItem={(t, update, i) => (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField label="Nama" value={t.name} onChange={(name) => update({ name })} error={ed.issue(`items.${i}.name`)} />
                  <TextField label="Produk (merek & tipe)" value={t.product} onChange={(product) => update({ product })} />
                </div>
                <TextArea label="Kenapa alat ini dipakai" value={t.description} onChange={(description) => update({ description })} rows={2} />
                <MediaField label="Foto" kind="image" aspect="4/3" value={t.photo} onChange={(photo) => update({ photo })} />
              </>
            )}
          />
        </Card>
      </div>
      <SaveBar dirty={ed.dirty} pending={ed.pending} result={ed.result} onSave={ed.save} onReset={ed.reset} />
    </>
  );
}

// ───────────── Kontak ─────────────

export function ContactEditor({ initial }: { initial: SiteContent["contact"] }) {
  const ed = useSectionEditor("contact", initial);
  const { draft: d, setDraft } = ed;
  const set = (patch: Partial<typeof d>) => setDraft({ ...d, ...patch });

  return (
    <>
      <Card title="Kontak" description="Bagian form kontak dan baris bawah footer.">
        <TextField label="Judul" value={d.heading} onChange={(heading) => set({ heading })} />
        <TextArea label="Teks" value={d.text} onChange={(text) => set({ text })} rows={3} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Email" type="email" value={d.email} onChange={(email) => set({ email })} error={ed.issue("email")} />
          <TextField label="Telepon / WhatsApp" value={d.phone} onChange={(phone) => set({ phone })} placeholder="0851 8681 5801" />
        </div>
      </Card>
      <SaveBar dirty={ed.dirty} pending={ed.pending} result={ed.result} onSave={ed.save} onReset={ed.reset} />
    </>
  );
}
