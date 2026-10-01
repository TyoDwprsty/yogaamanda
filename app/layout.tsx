import type { Metadata, Viewport } from "next";
import { Montserrat, Newsreader } from "next/font/google";
import { CustomScrollbar } from "@/components/fx/custom-scrollbar";
import { InlineScript } from "@/components/fx/inline-script";
import { SmoothScroll } from "@/components/fx/smooth-scroll";
import { THEME_STORAGE_KEY } from "@/components/fx/theme-key";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Yoga Amanda — Cerita terbaik",
  description:
    "Content creator dan public speaker. Model kit, Gunpla, Blokees, dan cerita pop culture dari Yoga Amanda.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070605" },
    { media: "(prefers-color-scheme: light)", color: "#fcfaf7" },
  ],
};

// Runs before first paint so the saved theme never flashes.
const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" data-theme="dark" className={`${montserrat.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="min-h-dvh antialiased">
        <SmoothScroll />
        {children}
        <CustomScrollbar />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
