import { GoldText } from "@/components/fx/gold-text";
import { ProfileRing } from "@/components/fx/profile-ring";
import { Reveal } from "@/components/fx/reveal";
import type { SiteContent } from "@/lib/content/schema";
import { SocialLinks } from "./social-links";

export function Hero({ profile }: { profile: SiteContent["profile"] }) {
  return (
    <header
      id="top"
      className="relative z-10 flex flex-col items-center px-6 pt-[124px] pb-14 text-center md:pt-[176px] md:pb-20"
    >
      <Reveal y={12}>
        <ProfileRing src={profile.avatar} alt={`Foto ${profile.name}`} />
      </Reveal>

      <Reveal delay={0.1} y={16}>
        <h1 className="mt-8 max-w-[11ch] text-[64px] leading-[0.9] font-extrabold tracking-[-0.045em] text-ink md:mt-10 md:max-w-none md:text-[clamp(88px,9vw,128px)] md:leading-[0.92]">
          {profile.name}
        </h1>
      </Reveal>

      {profile.tagline && (
        <Reveal delay={0.2} y={12} className="mt-[18px] md:mt-[22px]">
          <p className="font-serif text-[28px] leading-[1.2] italic md:text-[38px]">
            <GoldText>{profile.tagline}</GoldText>
          </p>
        </Reveal>
      )}

      {profile.bio && (
        <Reveal delay={0.28} y={12}>
          <p className="mt-5 max-w-[330px] text-base leading-[1.6] text-muted md:mt-7 md:max-w-[560px] md:text-lg md:leading-[1.65]">
            {profile.bio}
          </p>
        </Reveal>
      )}

      <Reveal delay={0.36} y={12} className="mt-8 md:mt-10">
        <SocialLinks socials={profile.socials} />
      </Reveal>

      {profile.handleNote && (
        <Reveal delay={0.42} y={8}>
          <p className="mt-3.5 text-[13px] font-medium text-muted md:mt-4 md:text-sm">{profile.handleNote}</p>
        </Reveal>
      )}
    </header>
  );
}
