/** Flat gold lettering. Used sparingly: one gold accent per screen. */
export function GoldText({ children, className = "" }: { children: string; className?: string }) {
  return <span className={`text-gold-text ${className}`}>{children}</span>;
}
