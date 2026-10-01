// Optimizes the source media in public/assets into web-ready files in public/media.
//
//   npm run media
//
// - The 21:9 hero video is re-encoded with x264 (CRF 20, preset slow), which is
//   visually lossless but a fraction of the original bitrate. A 1280px rendition is
//   also produced for small screens.
// - Short videos are already light, so they are only remuxed (no quality loss).
// - Every video gets "faststart" so playback can begin before the file is fully
//   downloaded, plus a WebP poster frame.
// - Images are converted to high-quality WebP at their native size.
//
// Re-running skips outputs that are newer than their source.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const SRC = path.join(root, "public", "assets");
const OUT = path.join(root, "public", "media");
mkdirSync(OUT, { recursive: true });

const force = process.argv.includes("--force");

const videos = [
  {
    src: "Video 21 9.mp4",
    out: "hero-21x9",
    reencode: true,
    posterAt: 5,
    stills: [
      { at: 9, out: "still-figures.webp" },
      { at: 5, out: "still-studio.webp" },
    ],
    renditions: [
      { suffix: "", scale: null },
      { suffix: "-1280", scale: 1280 },
    ],
  },
  { src: "Video 1.mp4", out: "short-1", posterAt: 0.6 },
  { src: "Video 2.mp4", out: "short-2", posterAt: 0.6 },
  { src: "Video 3.mp4", out: "short-3", posterAt: 0.6 },
];

const images = [
  { src: "Profile.jpeg", out: "profile.webp" },
  { src: "Logo podcast.jpg", out: "podcast.webp" },
];

function run(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", ...args], {
      stdio: ["ignore", "inherit", "inherit"],
    });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });
}

function fresh(src, out) {
  return !force && existsSync(out) && statSync(out).mtimeMs > statSync(src).mtimeMs;
}

const mb = (f) => (statSync(f).size / 1024 / 1024).toFixed(1) + "MB";

for (const v of videos) {
  const src = path.join(SRC, v.src);
  if (!existsSync(src)) {
    console.warn(`skip: ${v.src} not found`);
    continue;
  }

  for (const r of v.renditions ?? [{ suffix: "", scale: null }]) {
    const out = path.join(OUT, `${v.out}${r.suffix}.mp4`);
    if (fresh(src, out)) continue;
    console.log(`video  ${v.src} -> ${path.basename(out)}`);

    if (v.reencode) {
      await run([
        "-i", src,
        ...(r.scale ? ["-vf", `scale=${r.scale}:-2:flags=lanczos`] : []),
        "-c:v", "libx264", "-profile:v", "high", "-preset", "slow",
        "-crf", r.scale ? "21" : "20",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "160k",
        "-movflags", "+faststart",
        out,
      ]);
    } else {
      await run(["-i", src, "-c", "copy", "-movflags", "+faststart", out]);
    }
    console.log(`       ${mb(src)} -> ${mb(out)}`);
  }

  const frames = [
    { at: v.posterAt ?? 0.6, out: `${v.out}-poster.webp`, quality: 82 },
    ...(v.stills ?? []).map((s) => ({ ...s, quality: 90 })),
  ];
  for (const f of frames) {
    const target = path.join(OUT, f.out);
    if (fresh(src, target)) continue;
    const tmp = target.replace(/\.webp$/, ".png");
    await run(["-ss", String(f.at), "-i", src, "-frames:v", "1", tmp]);
    await sharp(tmp).webp({ quality: f.quality }).toFile(target);
    rmSync(tmp);
    console.log(`frame  ${f.out}`);
  }
}

for (const img of images) {
  const src = path.join(SRC, img.src);
  const out = path.join(OUT, img.out);
  if (!existsSync(src) || fresh(src, out)) continue;
  await sharp(src).rotate().webp({ quality: 90 }).toFile(out);
  console.log(`image  ${img.src} -> ${img.out} (${mb(src)} -> ${mb(out)})`);
}

console.log("done");
