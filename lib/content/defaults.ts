import { DEFAULT_META_DESCRIPTION, type SiteContent } from "./schema";

// Initial content, taken from the design reference. The admin panel saves a copy of this
// to storage/content.json the first time anything is edited.
export const defaultContent: SiteContent = {
  profile: {
    name: "Yoga Amanda",
    tagline: "Carpe diem",
    bio: "Akan kuukur tingginya langit dari bagaimana aku jatuh ke bumi dan kuukur cepatnya dari angin yang melintasi telinga",
    handleNote: "",
    metaDescription: DEFAULT_META_DESCRIPTION,
    avatar: "/media/profile.webp",
    socials: [
      { id: "tiktok", platform: "tiktok", label: "TikTok @yogaamanda.a", url: "https://www.tiktok.com/@yogaamanda.a" },
      { id: "instagram", platform: "instagram", label: "Instagram @yogaamanda.a", url: "https://www.instagram.com/yogaamanda.a" },
      { id: "youtube", platform: "youtube", label: "YouTube @yogaamanda.a", url: "https://www.youtube.com/@yogaamanda.a" },
    ],
  },
  proof: {
    // Fallback counts read from the public profiles on 1 Oct 2026; the automatic reading
    // replaces them once it succeeds.
    followers: [
      { platform: "tiktok", username: "yogaamanda.a", mode: "auto", count: 9091, show: true },
      { platform: "instagram", username: "yogaamanda.a", mode: "auto", count: 525, show: true },
      { platform: "youtube", username: "yogaamanda.a", mode: "auto", count: 914, show: true },
    ],
  },
  video: {
    heading: "Video pilihan",
    allLabel: "Semua video di YouTube",
    allUrl: "https://www.youtube.com/@yogaamanda.a",
    main: {
      kind: "file",
      title: "Di balik rak koleksi",
      description: "",
      src: "/media/hero-21x9.mp4",
      srcMobile: "/media/hero-21x9-1280.mp4",
      poster: "/media/hero-21x9-poster.webp",
      youtubeUrl: "",
    },
    shorts: [
      { id: "short-1", title: "Aku skeptis", src: "/media/short-1.mp4", poster: "/media/short-1-poster.webp" },
      { id: "short-2", title: "Galaxy version", src: "/media/short-2.mp4", poster: "/media/short-2-poster.webp" },
      { id: "short-3", title: "Aku searching dulu", src: "/media/short-3.mp4", poster: "/media/short-3-poster.webp" },
    ],
  },
  contentMedia: {
    heading: "Content Media",
    subheading: "Empat kanal, satu pencerita.",
    items: [
      {
        id: "saturdate-line",
        title: "Saturdate Line",
        description: "Model kit, Gunpla, Blokees, dan obrolan pop culture.",
        kind: "image",
        src: "/media/still-figures.webp",
        poster: "",
        link: "",
      },
      {
        id: "yoga-amanda",
        title: "Yoga Amanda",
        description: "Keseharian, public speaking, dan cerita di balik layar.",
        kind: "image",
        src: "/media/still-studio.webp",
        poster: "",
        link: "",
      },
      {
        id: "dic-podcast",
        title: "Dan Ini Ceritaku Podcast",
        description: "Obrolan panjang tentang hidup, kerja, dan pilihan.",
        kind: "image",
        src: "/media/podcast.webp",
        poster: "",
        link: "",
      },
      {
        id: "dic",
        title: "Dan Ini Ceritaku",
        description: "Cerita pendek yang dekat dengan keseharian.",
        kind: "video",
        src: "/media/short-3.mp4",
        poster: "/media/short-3-poster.webp",
        link: "",
      },
    ],
  },
  tools: {
    heading: "Pewujud cerita",
    description: "Alat yang dipakai hampir setiap hari untuk merekam, bicara, dan merakit.",
    tabs: [
      {
        id: "alat",
        label: "Alat",
        photoMode: "tab",
        photo: "",
        items: [
          { id: "camera", label: "Camera", value: "[Merek & tipe kamera]", photo: "" },
          { id: "lighting", label: "Lighting", value: "[Lampu utama & fill light]", photo: "" },
          { id: "microphone", label: "Microphone", value: "[Merek & tipe mic]", photo: "" },
          { id: "smartphone", label: "Smartphone", value: "[Tipe HP]", photo: "" },
          { id: "tripod", label: "Tripod & gimbal", value: "[Merek & tipe]", photo: "" },
          { id: "hobby", label: "Hobby tools", value: "[Nipper, panel liner, dll.]", photo: "" },
        ],
      },
      {
        id: "studio",
        label: "Studio",
        photoMode: "row",
        photo: "",
        items: [
          { id: "room", label: "Ruangan", value: "[Ukuran & lokasi]", photo: "" },
          { id: "backdrop", label: "Backdrop", value: "[Rak koleksi, dinding, dll.]", photo: "" },
          { id: "desk", label: "Meja kerja", value: "[Meja rakit & penyimpanan]", photo: "" },
        ],
      },
    ],
  },
  contact: {
    heading: "Tell me a word",
    text: "Undangan bicara, kolaborasi konten, atau sekadar menyapa. Semua pesan dibaca sendiri.",
    email: "yogaamandaline@gmail.com",
    phone: "0851 8681 5801",
    showSocials: true,
    showForm: true,
  },
  footer: {
    title: "",
    tagline: "",
    copyright: "",
    showSocials: true,
    showEmail: true,
    showPhone: true,
  },
};
