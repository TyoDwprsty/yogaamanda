"use client";

/**
 * A script that runs while the HTML is parsed (before first paint). React warns about
 * rendering <script> on the client, so the client copy is inert ("text/plain");
 * suppressHydrationWarning accepts the type difference.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
