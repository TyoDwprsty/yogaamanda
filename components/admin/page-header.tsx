export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6 md:mb-8">
      <h1 className="text-[30px] leading-tight font-extrabold tracking-[-0.03em] text-ink md:text-[40px]">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{description}</p>}
    </header>
  );
}
