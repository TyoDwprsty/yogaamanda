import { GoldText } from "@/components/fx/gold-text";
import type { SiteContent } from "@/lib/content/schema";
import { container } from "./section";
import { SocialLinks } from "./social-links";

const LINKS = [
  { href: "#video", label: "Video" },
  { href: "#content", label: "Content" },
  { href: "#tools", label: "Tools" },
  { href: "#contact", label: "Contact" },
];

export function Footer({ content }: { content: SiteContent }) {
  const { profile, contact } = content;
  const tel = contact.phone.replace(/[^\d+]/g, "").replace(/^0/, "+62");
  return (
    <footer className="relative z-10 bg-bg2 pt-16 pb-10 md:pt-[88px]">
      <div className={`${container} flex flex-col gap-12 md:gap-16`}>
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div className="flex flex-col gap-2.5">
            <div className="text-[48px] leading-[0.95] font-extrabold tracking-[-0.045em] text-ink md:text-[72px]">{profile.name}</div>
            {profile.tagline && (
              <div className="font-serif text-[22px] italic md:text-[26px]">
                <GoldText>{profile.tagline}</GoldText>
              </div>
            )}
          </div>
          <div className="flex flex-col items-start gap-5 md:items-end">
            <nav aria-label="Navigasi footer" className="flex flex-wrap gap-x-7 gap-y-2 text-[15px] font-medium">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className="text-muted transition-colors duration-500 hover:text-ink">
                  {l.label}
                </a>
              ))}
            </nav>
            <SocialLinks socials={profile.socials} size="md" />
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-line pt-7 text-sm text-muted md:flex-row md:items-center">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <div className="flex flex-col gap-2 md:flex-row md:gap-7">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="transition-colors duration-500 hover:text-ink">
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${tel}`} className="transition-colors duration-500 hover:text-ink">
                {contact.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
