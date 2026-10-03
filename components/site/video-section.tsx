import { Reveal } from "@/components/fx/reveal";
import { SmartVideo } from "@/components/media/smart-video";
import { YouTubeEmbed, youTubeId } from "@/components/media/youtube-embed";
import type { SiteContent } from "@/lib/content/schema";
import { GoldLink, container } from "./section";

export function VideoSection({ video }: { video: SiteContent["video"] }) {
  const { main, shorts } = video;
  const isYouTube = main.kind === "youtube" && youTubeId(main.youtubeUrl);
  const hasMain = isYouTube || main.src;
  const title = main.title || video.heading;

  return (
    <section id="video" aria-labelledby="video-title" className={`${container} py-20 md:py-32`}>
      {/* Heading row: label, title and story on the left, the channel link on the right */}
      <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="flex max-w-[640px] flex-col gap-3 md:gap-4">
          <h2 id="video-title" className="text-[13px] font-semibold tracking-[0.14em] text-muted uppercase">
            {video.heading}
          </h2>
          {main.title && (
            <p className="text-[34px] leading-[1.02] font-extrabold tracking-[-0.035em] text-ink md:text-[56px]">{main.title}</p>
          )}
          {main.description && <p className="text-[15px] leading-[1.65] text-muted md:text-[17px]">{main.description}</p>}
        </div>
        {video.allUrl && (
          <GoldLink href={video.allUrl} className="shrink-0 text-[15px] md:pb-1">
            {video.allLabel || "Semua video"}
          </GoldLink>
        )}
      </Reveal>

      {/* Feature: full width */}
      {hasMain && (
        <Reveal delay={0.08} className="mt-8 md:mt-12">
          {/* Uploaded files go cinematic 21:9 on desktop; YouTube stays 16:9 so its player isn't letterboxed */}
          <div
            className={`relative aspect-video w-full overflow-hidden rounded-[20px] border border-line bg-surface md:rounded-[28px] ${
              isYouTube ? "" : "md:aspect-[21/9]"
            }`}
          >
            {isYouTube ? (
              <YouTubeEmbed url={main.youtubeUrl} title={title} />
            ) : (
              <SmartVideo
                src={main.src}
                srcMobile={main.srcMobile || undefined}
                poster={main.poster}
                title={title}
                trigger="view"
                variant="feature"
                sizes="(min-width: 1080px) 1040px, 100vw"
              />
            )}
          </div>
        </Reveal>
      )}

      {/* Shorts: three vertical clips under the feature */}
      {shorts.length > 0 && (
        <ul className="scroll-none -mx-5 mt-5 flex snap-x snap-mandatory scroll-px-5 gap-3.5 overflow-x-auto px-5 pb-1 md:mx-0 md:mt-6 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {shorts.map((s, i) => (
            <Reveal as="li" key={s.id} delay={0.06 + i * 0.06} className="w-[196px] shrink-0 snap-start md:w-auto">
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[18px] border border-line bg-surface md:rounded-[24px]">
                <SmartVideo
                  src={s.src}
                  poster={s.poster}
                  title={s.title || `Short video ${i + 1}`}
                  trigger="hover"
                  variant="short"
                  sizes="(min-width: 1080px) 330px, (min-width: 768px) 32vw, 196px"
                />
              </div>
            </Reveal>
          ))}
        </ul>
      )}
    </section>
  );
}
