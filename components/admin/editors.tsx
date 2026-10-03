"use client";

import {
  SOCIAL_PLATFORMS,
  type MediaItem,
  type Short,
  type SiteContent,
  type Social,
  type SocialPlatform,
  type ToolRow,
  type ToolTab,
} from "@/lib/content/schema";
import { Card, Segmented, SelectField, TextArea, TextField, Toggle } from "./fields";
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
        <Card
          title="Bagian paling atas (hero)"
          description="Foto bulat, nama besar, tulisan emas, dan teks di bawahnya. Nama & tulisan emas juga dipakai footer selama kolomnya di halaman Footer dikosongkan."
        >
          <MediaField
            label="Foto profil"
            kind="image"
            aspect="1/1"
            value={d.avatar}
            onChange={(avatar) => set({ avatar })}
            hint="Persegi, minimal 600×600px. Ditampilkan bulat dengan ring emas."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Nama (judul besar)" value={d.name} onChange={(name) => set({ name })} error={ed.issue("name")} />
            <TextField
              label="Tulisan emas miring (di bawah nama)"
              value={d.tagline}
              onChange={(tagline) => set({ tagline })}
              hint="Juga jadi judul tab browser: “Nama — tulisan ini”."
            />
          </div>
          <TextArea
            label="Teks di bawah tulisan emas"
            value={d.bio}
            onChange={(bio) => set({ bio })}
            rows={4}
            hint="Paragraf kecil abu-abu, tepat di atas ikon media sosial."
          />
          <TextField
            label="Catatan kecil di bawah ikon sosial (opsional)"
            value={d.handleNote}
            onChange={(handleNote) => set({ handleNote })}
            hint="Kosongkan untuk menyembunyikan."
          />
        </Card>

        <Card
          title="Google & preview link"
          description="Tidak tampil di halaman. Dipakai sebagai deskripsi di hasil pencarian Google dan saat link website dibagikan di WhatsApp, X, dll."
        >
          <TextArea
            label="Deskripsi website"
            value={d.metaDescription}
            onChange={(metaDescription) => set({ metaDescription })}
            rows={3}
            hint={`${d.metaDescription.length}/200 karakter. Idealnya 120–160: siapa kamu dan konten apa yang dibuat.`}
            error={ed.issue("metaDescription")}
          />
        </Card>

        <Card title="Media sosial" description="Ikon bulat di hero, bagian kontak, dan footer. Urutan di sini = urutan di website.">
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
                    placeholder={`${PLATFORM_LABEL[s.platform]} @username`}
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
        <Card
          title="Teks di atas video"
          description="Dari atas: label kecil huruf kapital, judul besar, deskripsi. Link tampil di sebelah kanannya."
        >
          <TextField label="Label kecil (huruf kapital, paling atas)" value={d.heading} onChange={(heading) => set({ heading })} />
          <TextField
            label="Judul besar"
            value={d.main.title}
            onChange={(title) => setMain({ title })}
            hint="Biasanya judul video utama. Kosongkan untuk menyembunyikan."
          />
          <TextArea
            label="Deskripsi singkat (opsional)"
            value={d.main.description}
            onChange={(description) => setMain({ description })}
            rows={3}
            hint="Satu-dua kalimat di bawah judul: tentang apa, kenapa layak ditonton."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Teks link (kanan)"
              value={d.allLabel}
              onChange={(allLabel) => set({ allLabel })}
              hint="Kosongkan URL untuk menyembunyikan link."
            />
            <TextField label="URL link" value={d.allUrl} onChange={(allUrl) => set({ allUrl })} error={ed.issue("allUrl")} />
          </div>
        </Card>

        <Card
          title="Video utama"
          description="Full lebar di bawah teks. File upload tampil 21:9 di desktop (16:9 di HP); YouTube selalu 16:9. Video 16:9 tetap bisa di-upload, atas-bawahnya di-crop rapi di tengah."
        >
          <Segmented
            label="Sumber"
            value={d.main.kind}
            onChange={(kind) => setMain({ kind })}
            options={[
              { value: "file", label: "Upload file" },
              { value: "youtube", label: "YouTube" },
            ]}
          />
          {d.main.kind === "file" ? (
            <>
              <MediaField
                label="Video (desktop)"
                kind="video"
                aspect="21/9"
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
                aspect="21/9"
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

        <Card
          title="Short video"
          description="Kartu vertikal 9:16, tiga per baris tepat di bawah video utama. Paling rapi 3 atau kelipatannya; maksimal 9."
        >
          <ListEditor<Short>
            items={d.shorts}
            onChange={(shorts) => set({ shorts })}
            max={9}
            addLabel="Tambah short"
            create={() => ({ id: newId(), title: "", src: "", poster: "" })}
            itemLabel={(s, i) => s.title || `Short video ${i + 1}`}
            renderItem={(s, update) => (
              <>
                <TextField
                  label="Judul"
                  value={s.title}
                  onChange={(title) => update({ title })}
                  hint="Tidak tampil sebagai teks; dipakai pembaca layar dan untuk mengenali video di sini."
                />
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
        <Card title="Teks judul" description="Judul besar di kiri, teks miring di kanannya.">
          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Judul besar (kiri)" value={d.heading} onChange={(heading) => set({ heading })} />
            <TextField label="Teks miring (kanan)" value={d.subheading} onChange={(subheading) => set({ subheading })} />
          </div>
        </Card>
        <Card
          title="Kanal"
          description="Grid 2 kolom sama besar (media 4:3), urut kiri ke kanan lalu turun; jumlah genap paling rapi. Bisa foto, GIF (otomatis jadi WebP animasi yang jauh lebih ringan) atau video."
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
        <Card title="Teks judul" description="Judul besar dan kalimat di bawahnya.">
          <TextField label="Judul besar" value={d.heading} onChange={(heading) => set({ heading })} />
          <TextArea label="Kalimat di bawah judul" value={d.description} onChange={(description) => set({ description })} rows={2} />
        </Card>
        <Card
          title="Tab"
          description="Tombol di atas daftar (mis. Alat dan Studio). Tiap tab punya satu foto besar dan daftarnya sendiri. Baris daftar tidak bisa diklik, hanya menyala saat disorot. Tinggi bagian ini tetap: kalau barisnya banyak, daftarnya bisa di-scroll dan foto tidak ikut memanjang."
        >
          {ed.issue("tabs") && <p className="text-[12.5px] font-medium text-[#e5866b]">{ed.issue("tabs")}</p>}
          <ListEditor<ToolTab>
            items={d.tabs}
            onChange={(tabs) => set({ tabs })}
            max={4}
            addLabel="Tambah tab"
            create={() => ({ id: newId(), label: "", photo: "", items: [] })}
            itemLabel={(t, i) => t.label || `Tab ${i + 1}`}
            renderItem={(t, update, i) => (
              <>
                <TextField
                  label="Nama tab (tulisan di tombol)"
                  value={t.label}
                  onChange={(label) => update({ label })}
                  error={ed.issue(`tabs.${i}.label`)}
                />
                <MediaField
                  label="Foto tab ini"
                  kind="image"
                  aspect="4/5"
                  value={t.photo}
                  onChange={(photo) => update({ photo })}
                  hint="Tampil tinggi di kanan daftar (desktop) dan melebar di atas daftar (HP), di-crop di tengah. Portrait 4:5 paling aman."
                />
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-semibold text-ink">Daftar</span>
                  <ListEditor<ToolRow>
                    items={t.items}
                    onChange={(items) => update({ items })}
                    max={20}
                    addLabel="Tambah baris"
                    create={() => ({ id: newId(), label: "", value: "" })}
                    itemLabel={(r, j) => r.label || `Baris ${j + 1}`}
                    renderItem={(r, updateRow) => (
                      <div className="grid gap-4 md:grid-cols-2">
                        <TextField label="Label (tebal)" value={r.label} onChange={(label) => updateRow({ label })} placeholder="Camera" />
                        <TextField
                          label="Isi (abu-abu, di bawah label)"
                          value={r.value}
                          onChange={(value) => updateRow({ value })}
                          placeholder="Merek & tipe"
                        />
                      </div>
                    )}
                  />
                </div>
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
      <Card
        title="Bagian kontak"
        description="Bagian terakhir sebelum footer: judul & teks di kiri, form pesan di kanan. Email dan telepon di sini juga dipakai footer."
      >
        <TextField label="Judul besar (di kiri form)" value={d.heading} onChange={(heading) => set({ heading })} />
        <TextArea label="Teks di bawah judul" value={d.text} onChange={(text) => set({ text })} rows={3} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Email" type="email" value={d.email} onChange={(email) => set({ email })} error={ed.issue("email")} />
          <TextField label="Telepon / WhatsApp" value={d.phone} onChange={(phone) => set({ phone })} placeholder="08xx xxxx xxxx" />
        </div>
        <div className="flex flex-col gap-1">
          <Toggle
            label="Tampilkan ikon media sosial di bawah email & telepon"
            checked={d.showSocials}
            onChange={(showSocials) => set({ showSocials })}
          />
          <span className="text-[12.5px] text-muted">Akun media sosialnya diatur di halaman Profil.</span>
        </div>
      </Card>
      <SaveBar dirty={ed.dirty} pending={ed.pending} result={ed.result} onSave={ed.save} onReset={ed.reset} />
    </>
  );
}

// ───────────── Footer ─────────────

export function FooterEditor({ initial, profile }: { initial: SiteContent["footer"]; profile: SiteContent["profile"] }) {
  const ed = useSectionEditor("footer", initial);
  const { draft: d, setDraft } = ed;
  const set = (patch: Partial<typeof d>) => setDraft({ ...d, ...patch });

  return (
    <>
      <div className="flex flex-col gap-6">
        <Card
          title="Teks footer"
          description="Kolom yang dikosongkan mengikuti halaman Profil (isinya tampil samar di dalam kolom), jadi cukup diubah sekali di sana."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Nama besar" value={d.title} onChange={(title) => set({ title })} placeholder={profile.name} />
            <TextField label="Tulisan emas miring" value={d.tagline} onChange={(tagline) => set({ tagline })} placeholder={profile.tagline} />
          </div>
          <TextField
            label="Nama di baris hak cipta"
            value={d.copyright}
            onChange={(copyright) => set({ copyright })}
            placeholder={profile.name}
            hint={`Tampil sebagai “© ${new Date().getFullYear()} ${d.copyright || profile.name}”. Tahun berganti otomatis.`}
          />
        </Card>
        <Card title="Yang ditampilkan" description="Email dan telepon diambil dari halaman Kontak, akun media sosial dari halaman Profil.">
          <Toggle label="Ikon media sosial" checked={d.showSocials} onChange={(showSocials) => set({ showSocials })} />
          <Toggle label="Email (baris paling bawah)" checked={d.showEmail} onChange={(showEmail) => set({ showEmail })} />
          <Toggle label="Telepon (baris paling bawah)" checked={d.showPhone} onChange={(showPhone) => set({ showPhone })} />
        </Card>
      </div>
      <SaveBar dirty={ed.dirty} pending={ed.pending} result={ed.result} onSave={ed.save} onReset={ed.reset} />
    </>
  );
}
