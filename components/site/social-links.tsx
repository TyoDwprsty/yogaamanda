import { Magnetic } from "@/components/fx/magnetic";
import { SOCIAL_ICONS } from "@/components/icons";
import type { Social } from "@/lib/content/schema";

export function SocialLinks({ socials, size = "lg" }: { socials: Social[]; size?: "lg" | "md" }) {
  const box = size === "lg" ? "size-[52px] md:size-14" : "size-12";
  const icon = size === "lg" ? 22 : 20;
  return (
    <div className="flex flex-wrap justify-center gap-3.5 md:gap-4">
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
