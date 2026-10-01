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
    <section id="video" aria-labelledby="video-title" className="relative z-10 py-20 md:py-32">
      {/* Feature: large frame with the story beside it */}
      <div className={`${container} grid grid-cols-1 gap-7 md:grid-cols-12 md:items-end md:gap-10`}>
        {hasMain && (
          <Reveal className="md:col-span-8">
            <div className="relative aspect-video w-full overflow-hidden rounded-[20px] border border-line bg-surface md:rounded-[24px]">
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
                  sizes="(min-width: 1080px) 680px, 100vw"
                />
              )}
            </div>
          </Reveal>
        )}

        <Reveal delay={0.08} className={`flex flex-col gap-4 ${hasMain ? "md:col-span-4 md:pb-2" : "md:col-span-12"}`}>
          <h2 id="video-title" className="text-[13px] font-semibold tracking-[0.14em] text-muted uppercase">
            {video.heading}
          </h2>
          {main.title && (
            <p className="text-[30px] leading-[1.05] font-extrabold tracking-[-0.035em] text-ink md:text-[40px]">{main.title}</p>
          )}
          {main.description && <p className="text-[15px] leading-[1.65] text-muted md:text-base">{main.description}</p>}
          {video.allUrl && (
            <GoldLink href={video.allUrl} className="mt-1 text-[15px]">
              {video.allLabel || "Semua video"}
            </GoldLink>
          )}
        </Reveal>
      </div>

      {/* Shorts: a label column, then the vertical clips with their titles */}
      {shorts.length > 0 && (
        <div className={`${container} mt-16 grid grid-cols-1 gap-6 md:mt-24 md:grid-cols-12 md:gap-10`}>
          <Reveal className="md:col-span-3">
            <h3 className="text-[22px] leading-tight font-bold tracking-[-0.02em] text-ink md:text-[26px]">{video.shortsHeading}</h3>
            <p className="mt-1.5 text-sm text-muted">{shorts.length} video</p>
          </Reveal>
          <ul className="scroll-none -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3.5 overflow-x-auto px-5 pb-1 md:col-span-9 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
            {shorts.map((s, i) => (
              <Reveal as="li" key={s.id} delay={0.06 + i * 0.06} className="w-[196px] shrink-0 snap-start md:w-auto">
                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[18px] border border-line bg-surface md:rounded-[20px]">
                  <SmartVideo
                    src={s.src}
                    poster={s.poster}
                    title={s.title || `Short video ${i + 1}`}
                    trigger="hover"
                    variant="short"
                    sizes="(min-width: 768px) 230px, 196px"
                  />
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
