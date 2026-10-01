# Yoga Amanda — Portfolio

Website portfolio Yoga Amanda (Next.js 16, Tailwind 4, Motion) dengan palet **Amber Crown**, plus panel admin untuk mengubah konten. Data disimpan di **Neon** (PostgreSQL via Prisma 7) dan file upload di **Neon Storage** (S3-compatible).

## Menjalankan

```bash
npm install                  # juga menjalankan `prisma generate`
cp .env.example .env.local   # lalu isi nilainya
npm run db:deploy            # buat tabel di database (sekali, dan tiap ada migrasi baru)
npm run dev                  # http://localhost:3000
```

Admin: `http://localhost:3000/admin`. Login pakai `ADMIN_USERNAME` / `ADMIN_PASSWORD` dari `.env.local`.

| Variabel | Keterangan |
| --- | --- |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Akun admin (sementara hardcoded di env) |
| `AUTH_SECRET` | Kunci tanda tangan cookie session, minimal 32 karakter acak |
| `DATABASE_URL` | Connection string Neon (pakai yang **Pooled**) |
| `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET` | Object storage S3-compatible (Neon Storage, atau R2 nanti) |
| `S3_PUBLIC_URL` | Opsional, hanya kalau bucket publik (mis. R2 + custom domain) |
| `STORAGE_DIR` | Opsional. Folder upload lokal saat storage belum diisi. Default `./storage` |
| `YOUTUBE_API_KEY` | Opsional. YouTube Data API v3 (gratis) untuk jumlah subscriber yang lebih stabil |

## Media

File mentah ada di `public/assets/`. Versi yang dipakai website ada di `public/media/`, dibuat oleh:

```bash
npm run media          # hanya memproses file yang berubah
npm run media -- --force
```

- Video 21:9 di-encode ulang (H.264 CRF 20, visually lossless): 63MB → ~27MB, resolusi dan 60fps tetap. Ada juga versi 1280px (~8MB) untuk HP.
- Short video hanya di-remux (tanpa re-encode, jadi kualitas tidak turun) dengan `faststart`, supaya bisa langsung diputar sebelum file selesai diunduh.
- Poster WebP dan gambar WebP kualitas 90.

Upload dari admin dioptimalkan otomatis: gambar dikonversi ke WebP kualitas 90 (GIF jadi WebP animasi), dan video dibuatkan poster dari frame-nya. Video tidak diproses ulang di server; kalau MP4 belum "fast start", admin akan memberi peringatan (aktifkan opsi *Fast Start / Web Optimized* saat export).

`public/assets/` tidak dipakai oleh website. Folder ini boleh dipindah ke luar `public/` supaya tidak ikut ter-deploy (sesuaikan `SRC` di `scripts/optimize-media.mjs`).

## Jumlah pengikut

Diatur di **Admin → Bukti & pengikut**. Tiap platform (TikTok, Instagram, YouTube) cukup diisi username-nya, lalu pilih:

- **Otomatis**: angka dibaca dari profil publik tanpa API berbayar. YouTube memakai YouTube Data API kalau `YOUTUBE_API_KEY` diisi, kalau tidak dari halaman channel. TikTok dan Instagram dari data profil publiknya. Hasilnya disimpan di database (baris `followers:snapshot`) dan diperbarui di latar belakang tiap ±6 jam (halaman utama di-regenerate tiap 6 jam). Tombol *Ambil angka sekarang* membaca ulang saat itu juga.
- **Manual**: angka yang diketik selalu dipakai.

Di mode Otomatis, angka manual jadi cadangan selama pembacaan belum berhasil. Instagram dan TikTok bisa sewaktu-waktu membatasi request dari server; kalau itu terjadi, admin menampilkan pesan errornya dan website tetap memakai angka terakhir yang berhasil (atau angka manual).

## Database (Prisma + Neon)

- Schema: `prisma/schema.prisma`. Tabel `SiteSection` (satu baris per bagian website, isinya JSON yang divalidasi zod di `lib/content/schema.ts`) dan `Message` (pesan dari form kontak).
- Client di-generate ke `lib/generated/prisma` (tidak di-commit).
- Ubah schema → `npm run db:migrate` (membuat migrasi baru) → commit folder `prisma/migrations`.
- Lihat isi database: `npm run db:studio`.
- Bagian yang belum pernah disimpan dari admin memakai isi default dari `lib/content/defaults.ts`. Tanpa `DATABASE_URL`, website tetap tampil dengan isi default, tapi admin tidak bisa menyimpan.

## Object storage

Upload memakai alur `sign → PUT → finalize`. Browser meng-upload file **langsung ke bucket** lewat signed URL (berlaku 15 menit), jadi video besar tidak melewati server. Setelah itu server mengonversi gambar ke WebP.

- **Neon Storage** bucket-nya private, jadi file disajikan lewat `/files/<key>` di website ini. Route ini mendukung Range request (video bisa di-seek) dan cache 1 tahun.
- **Pindah ke Cloudflare R2 nanti:** ganti `AWS_ENDPOINT_URL_S3` ke `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, `AWS_REGION=auto`, kredensial dan bucket R2. Kalau bucket punya domain publik, isi `S3_PUBLIC_URL` lalu build ulang, supaya file diambil langsung dari CDN Cloudflare. Pindahkan juga file yang sudah ada dari bucket lama.
- CORS bucket harus mengizinkan `PUT` dari domain website (bucket Neon saat ini sudah mengizinkan semua origin).
- Tanpa kredensial storage, file disimpan di `./storage/uploads` (untuk development).
