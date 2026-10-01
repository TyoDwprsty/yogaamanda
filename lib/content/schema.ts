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

export const profileSchema = z.object({
  name: text(80).min(1, "Nama wajib diisi"),
  tagline: text(80),
  bio: text(600),
  handleNote: text(120),
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
  shortsHeading: text(80).default("Short video"),
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

export const toolSchema = z.object({
  id,
  name: text(60).min(1, "Nama alat wajib diisi"),
  product: text(120),
  description: text(240),
  photo: mediaPath,
});

export const toolsSchema = z.object({
  heading: text(80),
  description: text(240),
  items: z.array(toolSchema).max(20),
});

export const contactSchema = z.object({
  heading: text(80),
  text: text(400),
  email: z.union([z.literal(""), z.string().trim().email("Email tidak valid").max(160)]),
  phone: text(40),
});

export const FOLLOWER_PLATFORMS = ["tiktok", "instagram", "youtube"] as const;

export const followerAccountSchema = z.object({
  platform: z.enum(FOLLOWER_PLATFORMS),
  /** Handle without "@"; a pasted profile link is normalized when used. */
  username: text(200),
  /** "auto" reads the count from the platform, "manual" always uses `count`. */
  mode: z.enum(["auto", "manual"]),
  /** Manual count. In auto mode it's the fallback until a fetch succeeds. */
  count: z.number().int().min(0).max(10_000_000_000),
  show: z.boolean(),
});

export const brandSchema = z.object({
  id,
  name: text(80).min(1, "Nama brand wajib diisi"),
  logo: mediaPath,
  url,
});

export const eventSchema = z.object({
  id,
  year: text(12),
  name: text(140).min(1, "Nama event wajib diisi"),
  detail: text(160),
  url,
});

export const proofSchema = z.object({
  followers: z.array(followerAccountSchema).max(FOLLOWER_PLATFORMS.length),
  brandsHeading: text(80),
  brands: z.array(brandSchema).max(30),
  eventsHeading: text(80),
  events: z.array(eventSchema).max(30),
});

export const siteContentSchema = z.object({
  profile: profileSchema,
  proof: proofSchema,
  video: videoSchema,
  contentMedia: contentMediaSchema,
  tools: toolsSchema,
  contact: contactSchema,
});

export const sectionSchemas = {
  profile: profileSchema,
  proof: proofSchema,
  video: videoSchema,
  contentMedia: contentMediaSchema,
  tools: toolsSchema,
  contact: contactSchema,
} as const;

export type SiteContent = z.infer<typeof siteContentSchema>;
export type SectionKey = keyof typeof sectionSchemas;
export type Social = z.infer<typeof socialSchema>;
export type SocialPlatform = Social["platform"];
export type Short = z.infer<typeof shortSchema>;
export type MediaItem = z.infer<typeof mediaItemSchema>;
export type Tool = z.infer<typeof toolSchema>;
export type FollowerPlatform = (typeof FOLLOWER_PLATFORMS)[number];
export type FollowerAccount = z.infer<typeof followerAccountSchema>;
export type Brand = z.infer<typeof brandSchema>;
export type SpeakingEvent = z.infer<typeof eventSchema>;

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
