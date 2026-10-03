import { z } from "zod";

// Media paths are either bundled (/media/...), uploaded through the admin (/files/...)
// or absolute http(s) URLs.
const mediaPath = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), "Path media tidak valid");

const url = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^(https?:\/\/|mailto:|tel:|#|\/)/.test(v), "URL tidak valid");

const id = z.string().trim().min(1).max(64);
const text = (max: number) => z.string().trim().max(max);

export const SOCIAL_PLATFORMS = ["tiktok", "instagram", "youtube", "x", "facebook", "spotify", "linkedin", "website"] as const;

export const socialSchema = z.object({
  id,
  platform: z.enum(SOCIAL_PLATFORMS),
  label: text(80),
  url,
});

export const DEFAULT_META_DESCRIPTION =
  "Content creator dan public speaker. Model kit, Gunpla, Blokees, dan cerita pop culture dari Yoga Amanda.";

export const profileSchema = z.object({
  name: text(80).min(1, "Nama wajib diisi"),
  tagline: text(80),
  bio: text(600),
  handleNote: text(120),
  /** Search-result and link-preview description; the bio is often too poetic for that. */
  metaDescription: text(200).default(DEFAULT_META_DESCRIPTION),
  avatar: mediaPath,
  socials: z.array(socialSchema).max(12),
});

export const shortSchema = z.object({
  id,
  title: text(120),
  src: mediaPath,
  poster: mediaPath,
});

export const videoSchema = z.object({
  heading: text(80),
  allLabel: text(60),
  allUrl: url,
  main: z.object({
    kind: z.enum(["file", "youtube"]),
    title: text(120),
    description: text(300).default(""),
    src: mediaPath,
    srcMobile: mediaPath,
    poster: mediaPath,
    youtubeUrl: url,
  }),
  shorts: z.array(shortSchema).max(9),
});

export const mediaItemSchema = z.object({
  id,
  title: text(120).min(1, "Judul wajib diisi"),
  description: text(300),
  kind: z.enum(["image", "video"]),
  src: mediaPath,
  poster: mediaPath,
  link: url,
});

export const contentMediaSchema = z.object({
  heading: text(80),
  subheading: text(160),
  items: z.array(mediaItemSchema).max(12),
});

export const toolRowSchema = z.object({
  id,
  label: text(60),
  value: text(160),
});

export const toolTabSchema = z.object({
  id,
  label: text(40).min(1, "Nama tab wajib diisi"),
  photo: mediaPath,
  items: z.array(toolRowSchema).max(20),
});

/** Before the tabs, each tool was its own row with a photo. Folds that into one "Alat" tab. */
function migrateTools(v: unknown) {
  if (!v || typeof v !== "object" || "tabs" in v || !("items" in v) || !Array.isArray(v.items)) return v;
  const old = v.items as { id?: string; name?: string; product?: string; photo?: string }[];
  const rest: Record<string, unknown> = { ...v };
  delete rest.items;
  return {
    ...rest,
    // The client renamed this section together with the switch to tabs.
    heading: rest.heading === "My daily driver" ? "Pewujud cerita" : rest.heading,
    tabs: [
      {
        id: "alat",
        label: "Alat",
        photo: old.find((t) => t.photo)?.photo ?? "",
        items: old.map((t, i) => ({ id: t.id || `alat-${i}`, label: t.name ?? "", value: t.product ?? "" })),
      },
      { id: "studio", label: "Studio", photo: "", items: [] },
    ],
  };
}

export const toolsSchema = z.preprocess(
  migrateTools,
  z.object({
    heading: text(80),
    description: text(240),
    tabs: z.array(toolTabSchema).min(1, "Minimal satu tab").max(4),
  }),
);

export const contactSchema = z.object({
  heading: text(80),
  text: text(400),
  email: z.union([z.literal(""), z.string().trim().email("Email tidak valid").max(160)]),
  phone: text(40),
  showSocials: z.boolean().default(true),
});

export const footerSchema = z.object({
  /** Empty = the name from Profil. */
  title: text(80),
  /** Empty = the tagline from Profil. */
  tagline: text(80),
  /** Shown after "© <year>". Empty = the name from Profil. */
  copyright: text(120),
  showSocials: z.boolean(),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
});

export const FOLLOWER_PLATFORMS = ["tiktok", "instagram", "youtube"] as const;

export const followerAccountSchema = z.object({
  platform: z.enum(FOLLOWER_PLATFORMS),
  /** Handle without "@"; a pasted profile link is normalized when used. */
  username: text(200),
  /**
   * "auto" reads the count from the platform in the background, "button" uses the last
   * reading but only reads again when the fetch button in the admin is clicked (for
   * platforms that refuse the host's servers), "manual" always uses `count`.
   */
  mode: z.enum(["auto", "button", "manual"]),
  /** Manual count. In auto and button mode it's the fallback until a fetch succeeds. */
  count: z.number().int().min(0).max(10_000_000_000),
  show: z.boolean(),
});

export const proofSchema = z.object({
  followers: z.array(followerAccountSchema).max(FOLLOWER_PLATFORMS.length),
});

export const siteContentSchema = z.object({
  profile: profileSchema,
  proof: proofSchema,
  video: videoSchema,
  contentMedia: contentMediaSchema,
  tools: toolsSchema,
  contact: contactSchema,
  footer: footerSchema,
});

export const sectionSchemas = {
  profile: profileSchema,
  proof: proofSchema,
  video: videoSchema,
  contentMedia: contentMediaSchema,
  tools: toolsSchema,
  contact: contactSchema,
  footer: footerSchema,
} as const;

export type SiteContent = z.infer<typeof siteContentSchema>;
export type SectionKey = keyof typeof sectionSchemas;
export type Social = z.infer<typeof socialSchema>;
export type SocialPlatform = Social["platform"];
export type Short = z.infer<typeof shortSchema>;
export type MediaItem = z.infer<typeof mediaItemSchema>;
export type ToolTab = z.infer<typeof toolTabSchema>;
export type ToolRow = z.infer<typeof toolRowSchema>;
export type FollowerPlatform = (typeof FOLLOWER_PLATFORMS)[number];
export type FollowerAccount = z.infer<typeof followerAccountSchema>;

export const messageInputSchema = z.object({
  name: text(80).min(1, "Nama wajib diisi"),
  phone: text(40),
  email: z.string().trim().email("Email tidak valid").max(160),
  note: text(2000).min(1, "Pesan wajib diisi"),
});

export type Message = z.infer<typeof messageInputSchema> & {
  id: string;
  createdAt: string;
  read: boolean;
};
