import type { Metadata, Viewport } from "next";
import { Montserrat, Newsreader } from "next/font/google";
import { CustomScrollbar } from "@/components/fx/custom-scrollbar";
import { InlineScript } from "@/components/fx/inline-script";
import { SmoothScroll } from "@/components/fx/smooth-scroll";
import { THEME_STORAGE_KEY } from "@/components/fx/theme-key";
import { getContent } from "@/lib/content/store";
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

// Title and description follow the Profil page in the admin.
export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();
  return {
    title: profile.tagline ? `${profile.name} — ${profile.tagline}` : profile.name,
    description: profile.metaDescription,
  };
}

// The site opens in the light theme regardless of the system setting.
export const viewport: Viewport = {
  themeColor: "#fcfaf7",
};

// Runs before first paint so the saved theme never flashes.
const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" data-theme="light" className={`${montserrat.variable} ${newsreader.variable}`} suppressHydrationWarning>
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
