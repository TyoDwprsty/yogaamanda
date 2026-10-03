import { Reveal } from "@/components/fx/reveal";
import { ArrowUpRightIcon, SOCIAL_ICONS } from "@/components/icons";
import { COUNT_NOUN, PLATFORM_NAME, formatCount, formatDate, formatFull } from "@/lib/followers/shared";
import type { FollowerStats } from "@/lib/followers/store";
import { container } from "./section";

/** Follower numbers right under the hero: the total large, each platform beside it. */
export function FollowerBand({ stats }: { stats: FollowerStats }) {
  if (!stats.items.length) return null;
  const showTotal = stats.items.length > 1;

  return (
    <section aria-label="Jumlah pengikut" className={`${container} pb-20 md:pb-28`}>
      <Reveal
        className={`grid grid-cols-2 gap-x-6 gap-y-9 md:items-end md:gap-x-10 ${
          showTotal ? "md:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]" : "md:grid-cols-3"
        }`}
      >
        {showTotal && (
          <div className="col-span-2 md:col-span-1">
            <div
              className="text-[56px] leading-none font-extrabold tracking-[-0.045em] text-ink tabular-nums md:text-[76px]"
              title={formatFull(stats.total)}
            >
              {formatCount(stats.total)}
            </div>
            <div className="mt-2.5 text-sm font-medium text-muted md:text-[15px]">
              pengikut di {stats.items.length} platform
              {stats.asOf && <span className="text-muted/80"> · per {formatDate(stats.asOf)}</span>}
            </div>
          </div>
        )}

        {stats.items.map((s) => {
          const Icon = SOCIAL_ICONS[s.platform];
          return (
            <a
              key={s.platform}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/stat flex flex-col"
              aria-label={`${formatFull(s.count)} ${COUNT_NOUN[s.platform]} ${PLATFORM_NAME[s.platform]} @${s.username}`}
            >
              <span className="text-[34px] leading-none font-extrabold tracking-[-0.035em] text-ink tabular-nums md:text-[42px]">
                {formatCount(s.count)}
              </span>
              <span className="mt-2.5 flex items-center gap-1.5 text-sm font-medium text-muted transition-colors duration-500 group-hover/stat:text-ink">
                <Icon size={15} />
                {COUNT_NOUN[s.platform]} {PLATFORM_NAME[s.platform]}
              </span>
              <span className="mt-0.5 inline-flex items-center gap-1 text-[13px] text-muted/80 transition-colors duration-500 group-hover/stat:text-ink">
                @{s.username}
                <ArrowUpRightIcon size={12} className="opacity-0 transition-opacity duration-500 group-hover/stat:opacity-100" />
              </span>
            </a>
          );
        })}
      </Reveal>
    </section>
  );
}
