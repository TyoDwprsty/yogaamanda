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
  const [featured, ...rest] = content.items;

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

      {featured && (
        <div className="mt-10 grid grid-cols-1 gap-12 md:mt-14 md:grid-cols-12 md:gap-10">
          {/* Featured channel */}
          <Reveal as="article" className={`group/card ${rest.length ? "md:col-span-7" : "md:col-span-12"}`}>
            <Wrap item={featured} className="flex flex-col gap-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border border-line bg-surface md:rounded-[24px]">
                <Media item={featured} sizes="(min-width: 768px) 600px, 100vw" />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[26px] leading-tight font-extrabold tracking-[-0.03em] text-ink md:text-[34px]">{featured.title}</h3>
                  {featured.description && (
                    <p className="max-w-[46ch] text-[15px] leading-[1.6] text-muted md:text-[17px]">{featured.description}</p>
                  )}
                </div>
                {featured.link && (
                  <span className="btn-ghost mt-1 grid size-11 shrink-0 place-items-center rounded-full text-ink">
                    <ArrowUpRightIcon size={16} />
                  </span>
                )}
              </div>
            </Wrap>
          </Reveal>

          {/* The rest: compact rows */}
          {rest.length > 0 && (
            <ul className="flex flex-col gap-7 md:col-span-5 md:justify-center md:gap-9">
              {rest.map((item, i) => (
                <Reveal as="li" key={item.id} delay={0.06 + i * 0.06} className="group/card">
                  <Wrap item={item} className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-4 md:grid-cols-[148px_minmax(0,1fr)] md:gap-5">
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-surface">
                      <Media item={item} sizes="148px" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="inline-flex items-center gap-1.5 text-lg leading-snug font-bold tracking-[-0.02em] text-ink md:text-xl">
                        {item.title}
                        {item.link && (
                          <ArrowUpRightIcon size={14} className="shrink-0 text-muted transition-colors group-hover/card:text-ink" />
                        )}
                      </h3>
                      {item.description && <p className="text-sm leading-[1.55] text-muted md:text-[15px]">{item.description}</p>}
                    </div>
                  </Wrap>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
