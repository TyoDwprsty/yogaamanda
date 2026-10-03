import { GoldText } from "@/components/fx/gold-text";
import type { SiteContent } from "@/lib/content/schema";
import { container } from "./section";
import { SocialLinks } from "./social-links";

/** Everything sits on the left; the right side is left open on purpose. */
export function Footer({ content }: { content: SiteContent }) {
  const { profile, contact, footer } = content;
  const title = footer.title || profile.name;
  const tagline = footer.tagline || profile.tagline;
  const owner = footer.copyright || profile.name;
  const tel = contact.phone.replace(/[^\d+]/g, "").replace(/^0/, "+62");
  const showSocials = footer.showSocials && profile.socials.some((s) => s.url);

  return (
    <footer className="relative z-10 bg-bg2 pt-16 pb-10 md:pt-[88px]">
      <div className={`${container} flex flex-col items-start gap-10 md:gap-12`}>
        <div className="flex flex-col gap-2.5">
          <div className="text-[48px] leading-[0.95] font-extrabold tracking-[-0.045em] text-ink md:text-[72px]">{title}</div>
          {tagline && (
            <div className="font-serif text-[22px] italic md:text-[26px]">
              <GoldText>{tagline}</GoldText>
            </div>
          )}
        </div>
        {showSocials && <SocialLinks socials={profile.socials} size="md" align="start" />}
        <div className="flex w-full flex-col gap-2 border-t border-line pt-7 text-sm text-muted md:flex-row md:flex-wrap md:items-center md:gap-x-7">
          <span>
            © {new Date().getFullYear()} {owner}
          </span>
          {footer.showEmail && contact.email && (
            <a href={`mailto:${contact.email}`} className="transition-colors duration-500 hover:text-ink">
              {contact.email}
            </a>
          )}
          {footer.showPhone && contact.phone && (
            <a href={`tel:${tel}`} className="transition-colors duration-500 hover:text-ink">
              {contact.phone}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
