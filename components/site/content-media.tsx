import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "@/components/fx/reveal";
import { ArrowUpRightIcon, ImageIcon } from "@/components/icons";
import { SmartVideo } from "@/components/media/smart-video";
import type { MediaItem, SiteContent } from "@/lib/content/schema";
import { container } from "./section";

function Media({ item, sizes }: { item: MediaItem; sizes: string }) {
  if (!item.src) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-2 text-muted">
        <ImageIcon size={26} />
        <span className="text-[12px] font-medium">Foto / Video / GIF</span>
      </div>
    );
  }
  if (item.kind === "video") {
    return <SmartVideo src={item.src} poster={item.poster} title={item.title} trigger="hover" variant="ambient" sizes={sizes} />;
  }
  return (
    <Image
      src={item.src}
      alt={item.title}
      fill
      quality={90}
      sizes={sizes}
      className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover/card:scale-[1.03]"
    />
  );
}

function Wrap({ item, className, children }: { item: MediaItem; className: string; children: ReactNode }) {
  return item.link ? (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  );
}

export function ContentMedia({ content }: { content: SiteContent["contentMedia"] }) {
  return (
    <section id="content" aria-labelledby="content-title" className={`${container} py-20 md:py-32`}>
      <Reveal className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-10">
        <h2 id="content-title" className="text-[38px] leading-none font-extrabold tracking-[-0.035em] text-ink md:text-[56px]">
          {content.heading}
        </h2>
        {content.subheading && (
          <p className="font-serif text-xl text-muted italic md:max-w-[340px] md:pb-1 md:text-right md:text-2xl">{content.subheading}</p>
        )}
      </Reveal>

      {/* Equal two-column grid; new channels simply add rows */}
      {content.items.length > 0 && (
        <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 md:mt-14 md:grid-cols-2 md:gap-x-10 md:gap-y-16">
          {content.items.map((item, i) => (
            <Reveal as="li" key={item.id} delay={(i % 2) * 0.08} className="group/card">
              <Wrap item={item} className="flex flex-col gap-5">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border border-line bg-surface md:rounded-[24px]">
                  <Media item={item} sizes="(min-width: 1080px) 500px, (min-width: 768px) 48vw, 100vw" />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[24px] leading-tight font-extrabold tracking-[-0.03em] text-ink md:text-[28px]">{item.title}</h3>
                    {item.description && <p className="max-w-[46ch] text-[15px] leading-[1.6] text-muted md:text-base">{item.description}</p>}
                  </div>
                  {item.link && (
                    <span className="btn-ghost mt-0.5 grid size-11 shrink-0 place-items-center rounded-full text-ink transition-colors duration-500 group-hover/card:border-line-strong group-hover/card:bg-surface-2">
                      <ArrowUpRightIcon size={16} />
                    </span>
                  )}
                </div>
              </Wrap>
            </Reveal>
          ))}
        </ul>
      )}
    </section>
  );
}
