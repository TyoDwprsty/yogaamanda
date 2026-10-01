"use client";

import { useState, useTransition } from "react";
import { refreshFollowers } from "@/app/admin/actions";
import { ArrowUpRightIcon, SOCIAL_ICONS } from "@/components/icons";
import type { Brand, FollowerAccount, SiteContent, SpeakingEvent } from "@/lib/content/schema";
import { COUNT_NOUN, PLATFORM_NAME, formatDate, formatFull, normalizeHandle, profileUrl } from "@/lib/followers/shared";
import type { FollowerSnapshot } from "@/lib/followers/store";
import { Card, NumberField, Segmented, TextField, Toggle } from "./fields";
import { ListEditor, newId } from "./list-editor";
import { MediaField } from "./media-field";
import { SaveBar, useSectionEditor } from "./use-section-editor";

const HANDLE_HINT: Record<FollowerAccount["platform"], string> = {
  tiktok: "Tanpa @. Boleh juga tempel link profil TikTok.",
  instagram: "Tanpa @. Boleh juga tempel link profil Instagram.",
  youtube: "Handle tanpa @ (atau ID channel UC…). Boleh tempel link channel.",
};

function Status({ account, snapshot }: { account: FollowerAccount; snapshot: FollowerSnapshot }) {
  const handle = normalizeHandle(account.platform, account.username);
  const entry = snapshot[account.platform];
  const current = entry && entry.username === handle ? entry : undefined;
  const autoCount = current?.count != null && current.fetchedAt ? current.count : null;
  const shown = account.mode === "auto" && autoCount != null ? autoCount : account.count;

  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-bg/60 px-4 py-3 text-[13px] leading-relaxed">
      {!handle ? (
        <span className="text-muted">Isi username dulu.</span>
      ) : current ? (
        <>
          {autoCount != null && current.fetchedAt && (
            <span className="text-ink">
              Terbaca otomatis: <b className="tabular-nums">{formatFull(autoCount)}</b>{" "}
              <span className="text-muted">· {formatDate(current.fetchedAt, true)}</span>
            </span>
          )}
          {current.error && (
            <span className="text-[#e5866b]">
              Gagal terakhir ({formatDate(current.attemptedAt, true)}): {current.error}
            </span>
          )}
        </>
      ) : (
        <span className="text-muted">Belum pernah diambil untuk username ini.</span>
      )}
      <span className="text-muted">
        Tampil di website:{" "}
        {account.show && shown > 0 ? (
          <b className="text-ink tabular-nums">
            {formatFull(shown)} {COUNT_NOUN[account.platform]}
          </b>
        ) : (
          <b className="text-ink">tidak ditampilkan</b>
        )}
        {account.show && shown === 0 && " (angka masih 0)"}
      </span>
    </div>
  );
}

export function ProofEditor({ initial, snapshot: initialSnapshot }: { initial: SiteContent["proof"]; snapshot: FollowerSnapshot }) {
  const ed = useSectionEditor("proof", initial);
  const { draft: d, setDraft } = ed;
  const set = (patch: Partial<typeof d>) => setDraft({ ...d, ...patch });
  const setAccount = (i: number, patch: Partial<FollowerAccount>) =>
    set({ followers: d.followers.map((a, j) => (j === i ? { ...a, ...patch } : a)) });

  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [fetchMsg, setFetchMsg] = useState<string | null>(null);
  const [fetching, startFetch] = useTransition();

  const fetchNow = () =>
    startFetch(async () => {
      setFetchMsg(null);
      const res = await refreshFollowers(d.followers);
      if (!res.ok) return setFetchMsg(res.error);
      setSnapshot(res.snapshot);
      setFetchMsg(res.saved ? null : "Angka terbaca, tapi tidak tersimpan karena DATABASE_URL belum diisi.");
    });

  return (
    <>
      <div className="flex flex-col gap-6">
        <Card
          title="Jumlah pengikut"
          description="Tampil tepat di bawah hero. Mode Otomatis membaca angka dari profil publik tiap ±6 jam; kalau gagal (Instagram dan TikTok kadang membatasi), angka manual yang dipakai."
          actions={
            <button
              type="button"
              onClick={fetchNow}
              disabled={fetching}
              className="btn-ghost h-10 shrink-0 cursor-pointer rounded-full px-4 text-[13px] font-semibold text-ink disabled:cursor-wait disabled:opacity-60"
            >
              {fetching ? "Mengambil…" : "Ambil angka sekarang"}
            </button>
          }
        >
          {fetchMsg && <p className="text-[13px] font-medium text-[#e5866b]">{fetchMsg}</p>}
          {d.followers.map((a, i) => {
            const Icon = SOCIAL_ICONS[a.platform];
            const url = profileUrl(a.platform, a.username);
            return (
              <div key={a.platform} className="flex flex-col gap-4 rounded-2xl border border-line p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-ink">
                    <Icon size={16} /> {PLATFORM_NAME[a.platform]}
                  </span>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[13px] font-semibold text-muted transition-colors hover:text-ink"
                    >
                      Buka profil <ArrowUpRightIcon size={13} />
                    </a>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Username"
                    value={a.username}
                    onChange={(username) => setAccount(i, { username })}
                    placeholder="yogaamanda.a"
                    hint={HANDLE_HINT[a.platform]}
                    error={ed.issue(`followers.${i}.username`)}
                  />
                  <NumberField
                    label={a.mode === "manual" ? "Jumlah (manual)" : "Angka cadangan (manual)"}
                    value={a.count}
                    onChange={(count) => setAccount(i, { count })}
                    hint={a.mode === "manual" ? "Selalu angka ini yang tampil." : "Dipakai sampai pembacaan otomatis berhasil."}
                    error={ed.issue(`followers.${i}.count`)}
                  />
                </div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <Segmented
                    label="Sumber angka"
                    value={a.mode}
                    onChange={(mode) => setAccount(i, { mode })}
                    options={[
                      { value: "auto", label: "Otomatis" },
                      { value: "manual", label: "Manual" },
                    ]}
                  />
                  <Toggle label="Tampilkan di website" checked={a.show} onChange={(show) => setAccount(i, { show })} />
                </div>
                <Status account={a} snapshot={snapshot} />
              </div>
            );
          })}
          <p className="text-[12.5px] leading-relaxed text-muted">
            YouTube lebih stabil kalau <code className="text-ink">YOUTUBE_API_KEY</code> (gratis dari Google Cloud) diisi di env. Tanpa
            itu, angka dibaca dari halaman channel.
          </p>
        </Card>

        <Card title="Brand kolaborasi" description="Ditulis sebagai nama, atau logo kalau di-upload (tampil abu-abu, berwarna saat disorot).">
          <TextField label="Judul" value={d.brandsHeading} onChange={(brandsHeading) => set({ brandsHeading })} />
          <ListEditor<Brand>
            items={d.brands}
            onChange={(brands) => set({ brands })}
            max={30}
            addLabel="Tambah brand"
            create={() => ({ id: newId(), name: "", logo: "", url: "" })}
            itemLabel={(b, i) => b.name || `Brand ${i + 1}`}
            renderItem={(b, update, i) => (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField label="Nama brand" value={b.name} onChange={(name) => update({ name })} error={ed.issue(`brands.${i}.name`)} />
                  <TextField
                    label="Link (opsional)"
                    value={b.url}
                    onChange={(url) => update({ url })}
                    placeholder="https://"
                    error={ed.issue(`brands.${i}.url`)}
                  />
                </div>
                <MediaField
                  label="Logo (opsional)"
                  kind="image"
                  aspect="3/1"
                  value={b.logo}
                  onChange={(logo) => update({ logo })}
                  hint="PNG/SVG transparan paling bagus. Kosongkan untuk menampilkan nama saja."
                />
              </>
            )}
          />
        </Card>

        <Card title="Pernah jadi pembicara" description="Urutan di sini = urutan di website. Taruh yang terbaru di atas.">
          <TextField label="Judul" value={d.eventsHeading} onChange={(eventsHeading) => set({ eventsHeading })} />
          <ListEditor<SpeakingEvent>
            items={d.events}
            onChange={(events) => set({ events })}
            max={30}
            addLabel="Tambah event"
            create={() => ({ id: newId(), year: String(new Date().getFullYear()), name: "", detail: "", url: "" })}
            itemLabel={(e, i) => e.name || `Event ${i + 1}`}
            renderItem={(e, update, i) => (
              <>
                <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                  <TextField label="Tahun" value={e.year} onChange={(year) => update({ year })} />
                  <TextField label="Nama event" value={e.name} onChange={(name) => update({ name })} error={ed.issue(`events.${i}.name`)} />
                </div>
                <TextField
                  label="Keterangan"
                  value={e.detail}
                  onChange={(detail) => update({ detail })}
                  placeholder="Penyelenggara · kota, atau topik yang dibawakan"
                />
                <TextField
                  label="Link (opsional)"
                  value={e.url}
                  onChange={(url) => update({ url })}
                  placeholder="https://"
                  error={ed.issue(`events.${i}.url`)}
                />
              </>
            )}
          />
        </Card>
      </div>
      <SaveBar dirty={ed.dirty} pending={ed.pending} result={ed.result} onSave={ed.save} onReset={ed.reset} />
    </>
  );
}
