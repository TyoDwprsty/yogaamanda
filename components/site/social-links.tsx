import { Magnetic } from "@/components/fx/magnetic";
import { SOCIAL_ICONS } from "@/components/icons";
import type { Social } from "@/lib/content/schema";

const PLATFORM_NAME: Record<Social["platform"], string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  facebook: "Facebook",
  spotify: "Spotify",
  linkedin: "LinkedIn",
  website: "Website",
};

// First path segments that aren't a username (youtube.com/channel/…, facebook.com/profile.php, …).
const NOT_A_HANDLE = new Set(["c", "channel", "user", "in", "company", "show", "artist", "profile.php", "pages", "people"]);

/** The account's name as people type it, e.g. "@yogaamanda.a", read from the URL with the label as fallback. */
export function socialHandle(s: Social) {
  try {
    const u = new URL(s.url);
    const host = u.hostname.replace(/^www\./, "");
    const [first, second] = u.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    if (s.platform === "website") return host + (first ? u.pathname.replace(/\/$/, "") : "");
    if (s.platform === "linkedin" && (first === "in" || first === "company") && second) return second;
    if (first?.startsWith("@")) return first;
    if (first && !NOT_A_HANDLE.has(first)) return s.platform === "facebook" ? first : `@${first}`;
  } catch {}
  const at = s.label.match(/@[\w.-]+/);
  return at?.[0] ?? (s.label || PLATFORM_NAME[s.platform]);
}

export function SocialLinks({
  socials,
  size = "lg",
  align = "center",
}: {
  socials: Social[];
  size?: "lg" | "md";
  align?: "center" | "start";
}) {
  const box = size === "lg" ? "size-[52px] md:size-14" : "size-12";
  const icon = size === "lg" ? 22 : 20;
  return (
    <div className={`flex flex-wrap gap-3.5 md:gap-4 ${align === "center" ? "justify-center" : "justify-start"}`}>
      {socials
        .filter((s) => s.url)
        .map((s) => {
          const Icon = SOCIAL_ICONS[s.platform];
          return (
            <Magnetic key={s.id} strength={0.35}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label || s.platform}
                className={`btn-ghost grid ${box} place-items-center rounded-full ${size === "lg" ? "bg-surface" : ""} text-ink`}
              >
                <Icon size={icon} />
              </a>
            </Magnetic>
          );
        })}
    </div>
  );
}
