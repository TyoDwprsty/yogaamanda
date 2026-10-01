import Image from "next/image";

/** Round avatar inside a thin hairline frame. */
export function ProfileRing({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="size-[148px] rounded-full border border-line-strong p-1.5 md:size-[200px] md:p-2">
      <div className="relative size-full overflow-hidden rounded-full bg-surface">
        {src ? (
          <Image src={src} alt={alt} fill sizes="(min-width: 768px) 184px, 136px" quality={90} preload className="object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-xs font-medium text-muted">Foto profil</span>
        )}
      </div>
    </div>
  );
}
